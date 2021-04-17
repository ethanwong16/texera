package edu.uci.ics.texera.workflow.operators.sort

import edu.uci.ics.amber.engine.common.{Constants, InputExhausted}
import edu.uci.ics.amber.engine.common.amberexception.WorkflowRuntimeException
import edu.uci.ics.amber.engine.common.virtualidentity.{ActorVirtualIdentity, LinkIdentity}
import edu.uci.ics.amber.error.WorkflowRuntimeError
import edu.uci.ics.texera.workflow.common.operators.OperatorExecutor
import edu.uci.ics.texera.workflow.common.tuple.Tuple
import edu.uci.ics.texera.workflow.common.tuple.schema.{Attribute, Schema}

import scala.collection.mutable
import scala.collection.mutable.ArrayBuffer

class SortOpLocalExec(
    val sortAttributeName: String,
    val rangeMin: Float,
    val rangeMax: Float,
    val localIdx: Int,
    val numWorkers: Int
) extends OperatorExecutor {

  var sortedTuples: ArrayBuffer[Tuple] = _

  // For free workers receiving data of skewed workers
  var tuplesFromSkewedWorker: ArrayBuffer[Tuple] = _
  @volatile var skewedWorkerIdentity: ActorVirtualIdentity = null

  // For skewed worker whose data is sent to free workers
  @volatile var sentTuplesToFree: Boolean = false
  @volatile var receivedTuplesFromFree: Boolean = false
  var receivedFromFreeWorker: ArrayBuffer[Tuple] = _

  val jump: Int =
    ((rangeMax - rangeMin) / numWorkers).toInt + 1
  val workerLowerLimitIncluded: Int = jump * localIdx
  val workerUpperLimitExcluded: Int =
    if (jump * (localIdx + 1) > rangeMax) rangeMax.toInt else jump * (localIdx + 1)

  def getSortedLists(): ArrayBuffer[ArrayBuffer[Tuple]] = {
    val sendingLists = new ArrayBuffer[ArrayBuffer[Tuple]]
    var count = 1
    var curr = new ArrayBuffer[Tuple]

    /** *< For Sort at end >**
      */
    val tuplesFromSkewedWorkerSorted = tuplesFromSkewedWorker.sortWith(
      _.getField(sortAttributeName).asInstanceOf[Float] > _.getField(sortAttributeName)
        .asInstanceOf[Float]
    )

    /** *</ For Sort at end >**
      */
    for (value <- tuplesFromSkewedWorkerSorted) {
      curr.append(value)
      if (count % 4000 == 0) {
        sendingLists.append(curr)
        curr = new ArrayBuffer[Tuple]
      }
      count += 1
    }
    if (!curr.isEmpty) sendingLists.append(curr)
    sendingLists
  }

  def addTupleToSortedList(tuple: Tuple, sortedList: ArrayBuffer[Tuple]): Unit = {
    if (sortedList.length == 0) {
      sortedList.append(tuple)
      return
    }

    var currIdx: Int = sortedList.length - 1
    var lastElem: Tuple = null
    while (
      currIdx >= 0 &&
      sortedList(currIdx).getField(sortAttributeName).asInstanceOf[Float] > tuple
        .getField(sortAttributeName)
        .asInstanceOf[Float]
    ) {
      if (currIdx == sortedList.length - 1) {
        lastElem = sortedList(sortedList.length - 1)
      } else {
        sortedList(currIdx + 1) = sortedList(currIdx)
      }
      currIdx -= 1
    }
    if (lastElem != null) {
      sortedList(currIdx + 1) = tuple
      sortedList.append(lastElem)
      lastElem = null
    } else {
      sortedList.append(tuple)
    }

  }

  override def processTexeraTuple(
      tuple: Either[Tuple, InputExhausted],
      input: LinkIdentity
  ): Iterator[Tuple] = {
    tuple match {
      case Left(t) =>
        if (
          t.getField(sortAttributeName).asInstanceOf[Float] >= workerLowerLimitIncluded && t
            .getField(sortAttributeName)
            .asInstanceOf[Float] < workerUpperLimitExcluded
        ) {
          // addTupleToSortedList(t, sortedTuples)
          /** *< For Sort at end >**
            */
          sortedTuples.append(t)

          /** *</ For Sort at end >**
            */
        } else {
          // addTupleToSortedList(t, tuplesFromSkewedWorker)
          /** *< For Sort at end >**
            */
          tuplesFromSkewedWorker.append(t)

          /** *</ For Sort at end >**
            */
        }
        Iterator()
      case Right(_) =>
        if (!sentTuplesToFree) {
          println(s"\t PRODUCED ${sortedTuples.size}")
          // sortedTuples.toIterator
          sortedTuples
            .sortWith(
              _.getField(sortAttributeName).asInstanceOf[Float] > _.getField(sortAttributeName)
                .asInstanceOf[Float]
            )
            .toIterator
        } else {
          println(s"\t PRODUCED ${sortedTuples.size + receivedFromFreeWorker.size}")

          /** *< For Sort at end >**
            */
          sortedTuples = sortedTuples
            .sortWith(
              _.getField(sortAttributeName).asInstanceOf[Float] > _.getField(sortAttributeName)
                .asInstanceOf[Float]
            )

          /** *</ For Sort at end >**
            */
          // merge the two sorted lists
          new Iterator[Tuple] {
            var ownListIdx = 0
            var gottenListIdx = 0
            override def hasNext: Boolean = {
              (ownListIdx < sortedTuples.size || gottenListIdx < receivedFromFreeWorker.size)
            }

            override def next(): Tuple = {
              if (ownListIdx < sortedTuples.size && gottenListIdx < receivedFromFreeWorker.size) {
                if (
                  sortedTuples(ownListIdx)
                    .getField(sortAttributeName)
                    .asInstanceOf[Float] < receivedFromFreeWorker(gottenListIdx)
                    .getField(sortAttributeName)
                    .asInstanceOf[Float]
                ) {

                  val ret = sortedTuples(ownListIdx)
                  ownListIdx += 1
                  ret
                } else {
                  val ret = receivedFromFreeWorker(gottenListIdx)
                  gottenListIdx += 1
                  ret
                }
              } else if (ownListIdx < sortedTuples.size) {
                val ret = sortedTuples(ownListIdx)
                ownListIdx += 1
                ret
              } else {
                val ret = receivedFromFreeWorker(gottenListIdx)
                gottenListIdx += 1
                ret
              }
            }
          }
        }
    }
  }

  override def open(): Unit = {
    sortedTuples = new ArrayBuffer[Tuple]()
    tuplesFromSkewedWorker = new ArrayBuffer[Tuple]()
    receivedFromFreeWorker = new ArrayBuffer[Tuple]()
  }

  override def close(): Unit = {
    sortedTuples.clear()
    tuplesFromSkewedWorker.clear()
    receivedFromFreeWorker.clear()
  }
}
