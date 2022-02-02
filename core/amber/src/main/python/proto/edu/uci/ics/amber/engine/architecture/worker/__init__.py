# Generated by the protocol buffer compiler.  DO NOT EDIT!
# sources: edu/uci/ics/amber/engine/architecture/worker/controlcommands.proto, edu/uci/ics/amber/engine/architecture/worker/controlreturns.proto, edu/uci/ics/amber/engine/architecture/worker/statistics.proto
# plugin: python-betterproto
from dataclasses import dataclass
from typing import Dict, List

import betterproto
from betterproto.grpc.grpclib_server import ServiceBase


class WorkerState(betterproto.Enum):
    UNINITIALIZED = 0
    READY = 1
    RUNNING = 2
    PAUSED = 3
    COMPLETED = 4


@dataclass(eq=False, repr=False)
class StartWorkerV2(betterproto.Message):
    pass


@dataclass(eq=False, repr=False)
class PauseWorkerV2(betterproto.Message):
    pass


@dataclass(eq=False, repr=False)
class ResumeWorkerV2(betterproto.Message):
    pass


@dataclass(eq=False, repr=False)
class OpenOperatorV2(betterproto.Message):
    pass


@dataclass(eq=False, repr=False)
class UpdateInputLinkingV2(betterproto.Message):
    identifier: "__common__.ActorVirtualIdentity" = betterproto.message_field(1)
    input_link: "__common__.LinkIdentity" = betterproto.message_field(2)


@dataclass(eq=False, repr=False)
class AddPartitioningV2(betterproto.Message):
    tag: "__common__.LinkIdentity" = betterproto.message_field(1)
    partitioning: "_sendsemantics__.Partitioning" = betterproto.message_field(2)


@dataclass(eq=False, repr=False)
class WorkerExecutionCompletedV2(betterproto.Message):
    pass


@dataclass(eq=False, repr=False)
class QueryStatisticsV2(betterproto.Message):
    pass


@dataclass(eq=False, repr=False)
class QueryCurrentInputTupleV2(betterproto.Message):
    pass


@dataclass(eq=False, repr=False)
class LocalOperatorExceptionV2(betterproto.Message):
    message: str = betterproto.string_field(1)


@dataclass(eq=False, repr=False)
class InitializeOperatorLogicV2(betterproto.Message):
    code: str = betterproto.string_field(1)
    is_source: bool = betterproto.bool_field(2)
    output_schema: Dict[str, str] = betterproto.map_field(
        3, betterproto.TYPE_STRING, betterproto.TYPE_STRING
    )


@dataclass(eq=False, repr=False)
class ModifyOperatorLogicV2(betterproto.Message):
    code: str = betterproto.string_field(1)
    is_source: bool = betterproto.bool_field(2)


@dataclass(eq=False, repr=False)
class ReplayCurrentTupleV2(betterproto.Message):
    pass


@dataclass(eq=False, repr=False)
class PythonPrintV2(betterproto.Message):
    message: str = betterproto.string_field(1)


@dataclass(eq=False, repr=False)
class EvaluateExpressionV2(betterproto.Message):
    expression: str = betterproto.string_field(1)


@dataclass(eq=False, repr=False)
class ControlCommandV2(betterproto.Message):
    start_worker: "StartWorkerV2" = betterproto.message_field(1, group="sealed_value")
    pause_worker: "PauseWorkerV2" = betterproto.message_field(2, group="sealed_value")
    resume_worker: "ResumeWorkerV2" = betterproto.message_field(3, group="sealed_value")
    add_partitioning: "AddPartitioningV2" = betterproto.message_field(
        4, group="sealed_value"
    )
    update_input_linking: "UpdateInputLinkingV2" = betterproto.message_field(
        5, group="sealed_value"
    )
    query_statistics: "QueryStatisticsV2" = betterproto.message_field(
        6, group="sealed_value"
    )
    query_current_input_tuple: "QueryCurrentInputTupleV2" = betterproto.message_field(
        7, group="sealed_value"
    )
    local_operator_exception: "LocalOperatorExceptionV2" = betterproto.message_field(
        8, group="sealed_value"
    )
    open_operator: "OpenOperatorV2" = betterproto.message_field(9, group="sealed_value")
    initialize_operator_logic: "InitializeOperatorLogicV2" = betterproto.message_field(
        21, group="sealed_value"
    )
    modify_operator_logic: "ModifyOperatorLogicV2" = betterproto.message_field(
        22, group="sealed_value"
    )
    python_print: "PythonPrintV2" = betterproto.message_field(23, group="sealed_value")
    replay_current_tuple: "ReplayCurrentTupleV2" = betterproto.message_field(
        24, group="sealed_value"
    )
    evaluate_expression: "EvaluateExpressionV2" = betterproto.message_field(
        25, group="sealed_value"
    )
    worker_execution_completed: "WorkerExecutionCompletedV2" = (
        betterproto.message_field(101, group="sealed_value")
    )


@dataclass(eq=False, repr=False)
class WorkerStatistics(betterproto.Message):
    worker_state: "WorkerState" = betterproto.enum_field(1)
    input_tuple_count: int = betterproto.int64_field(2)
    output_tuple_count: int = betterproto.int64_field(3)


@dataclass(eq=False, repr=False)
class CurrentInputTupleInfo(betterproto.Message):
    pass


@dataclass(eq=False, repr=False)
class ControlException(betterproto.Message):
    msg: str = betterproto.string_field(1)


@dataclass(eq=False, repr=False)
class TypedValue(betterproto.Message):
    expression: str = betterproto.string_field(1)
    value_ref: str = betterproto.string_field(2)
    value_str: str = betterproto.string_field(3)
    value_type: str = betterproto.string_field(4)
    expandable: bool = betterproto.bool_field(5)


@dataclass(eq=False, repr=False)
class EvaluatedValue(betterproto.Message):
    value: "TypedValue" = betterproto.message_field(1)
    attributes: List["TypedValue"] = betterproto.message_field(2)


@dataclass(eq=False, repr=False)
class ControlReturnV2(betterproto.Message):
    control_exception: "ControlException" = betterproto.message_field(1, group="value")
    worker_statistics: "WorkerStatistics" = betterproto.message_field(2, group="value")
    worker_state: "WorkerState" = betterproto.enum_field(3, group="value")
    current_input_tuple_info: "CurrentInputTupleInfo" = betterproto.message_field(
        4, group="value"
    )
    evaluated_value: "EvaluatedValue" = betterproto.message_field(5, group="value")


from .. import sendsemantics as _sendsemantics__
from ... import common as __common__
