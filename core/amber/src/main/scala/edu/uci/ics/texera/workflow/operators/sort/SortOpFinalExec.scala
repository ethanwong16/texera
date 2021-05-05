package edu.uci.ics.texera.workflow.operators.sort

import edu.uci.ics.amber.engine.common.{Constants, InputExhausted}
import edu.uci.ics.amber.engine.common.amberexception.WorkflowRuntimeException
import edu.uci.ics.amber.engine.common.tuple.ITuple
import edu.uci.ics.amber.engine.common.virtualidentity.{LayerIdentity, LinkIdentity}
import edu.uci.ics.amber.error.WorkflowRuntimeError
import edu.uci.ics.texera.workflow.common.operators.OperatorExecutor
import edu.uci.ics.texera.workflow.common.tuple.Tuple
import edu.uci.ics.texera.workflow.common.tuple.schema.{Attribute, Schema}

import scala.collection.mutable
import scala.collection.mutable.ArrayBuffer

class SortOpFinalExec(
    val sortAttributeName: String,
    val rangeMin: Float,
    val rangeMax: Float,
    val numOfWorkers: Int
) extends OperatorExecutor {

  var sortedListsConcat: Array[ArrayBuffer[Tuple]] = _

  val jump: Int =
    ((rangeMax - rangeMin) / numOfWorkers).toInt + 1

  def getIndexOfWorker(t: Tuple): Int = {
    val fieldVal: Float = t.getField(sortAttributeName).asInstanceOf[Float]
    var idx: Int = 0
    while (fieldVal >= jump * idx) {
      idx = idx + 1
    }
    idx - 1
  }

  override def processTexeraTuple(
      tuple: Either[Tuple, InputExhausted],
      input: LinkIdentity
  ): Iterator[Tuple] = {
    tuple match {
      case Left(t) =>
        sortedListsConcat(getIndexOfWorker(t)).append(t)
        Iterator()
      case Right(_) =>
        var result: Iterator[Tuple] = Iterator()
        for (sortedList <- sortedListsConcat) {
          result = result ++ sortedList.toIterator
        }
        var increasing = true
        var num = -1f
        while(result.hasNext){
          val n = result.next().getField(sortAttributeName).asInstanceOf[Float]
          if(num<=n){num=n} else {
            increasing = false
          }
          println(s"Final Layer increasing = ${increasing.toString()}")
        }
        Iterator()
    }
  }

  override def open(): Unit = {
    sortedListsConcat = new Array[ArrayBuffer[Tuple]](numOfWorkers)
    for (i <- 0 to numOfWorkers - 1) { sortedListsConcat(i) = new ArrayBuffer[Tuple]() }
  }

  override def close(): Unit = {
    for (sortedList <- sortedListsConcat) { sortedList.clear() }
  }
}
