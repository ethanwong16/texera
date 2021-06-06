from dataclasses import dataclass
from queue import Queue
from typing import Iterable

from loguru import logger

from udf.udf_operator import UDFOperator
from util.stoppable_queue_blocking_thread import StoppableQueueBlockingThread
from worker.models.control_payload import ControlPayload
from worker.models.link_identity import LinkIdentity
from worker.models.tuple import DataTuple, ITuple


@dataclass
class InternalQueueElement:
    pass


@dataclass
class InputTuple(InternalQueueElement):
    tuple: DataTuple


@dataclass
class ControlElement(InternalQueueElement):
    cmd: ControlPayload


@dataclass
class EndMarker(InternalQueueElement):
    pass


@dataclass
class EndOfAllMarker(InternalQueueElement):
    pass


class DPThread(StoppableQueueBlockingThread):
    def __init__(self, input_queue: Queue, output_queue: Queue, udf_operator: UDFOperator):
        super().__init__(self.__class__.__name__, queue=input_queue)
        self._input_queue = input_queue
        self._output_queue = output_queue
        self._udf_operator = udf_operator

    def run(self) -> None:
        self._udf_operator.open()
        while self.running():
            next_entry = self._input_queue.get()
            if isinstance(next_entry, InputTuple):
                results: Iterable[ITuple] = self._udf_operator.process_texera_tuple(next_entry.tuple, LinkIdentity())
                for result in results:
                    self._output_queue.put(InputTuple(result))
            elif isinstance(next_entry, ControlElement):
                self.process_control_command(next_entry.cmd)
        self._udf_operator.close()

    @staticmethod
    def process_control_command(cmd: ControlPayload):
        logger.info(f"processing one control {cmd}")
