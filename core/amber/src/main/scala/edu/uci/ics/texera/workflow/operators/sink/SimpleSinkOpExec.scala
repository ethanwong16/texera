package edu.uci.ics.texera.workflow.operators.sink

import edu.uci.ics.amber.engine.common.tuple.ITuple
import edu.uci.ics.amber.engine.common.virtualidentity.LinkIdentity
import edu.uci.ics.amber.engine.common.{ITupleSinkOperatorExecutor, InputExhausted}
import edu.uci.ics.texera.workflow.common.tuple.Tuple

import java.io.{BufferedWriter, File, FileWriter}
import scala.collection.mutable

class SimpleSinkOpExec extends ITupleSinkOperatorExecutor {

  val results: mutable.MutableList[ITuple] = mutable.MutableList()

  def getResultTuples(): Array[ITuple] = {
    val file = new File("tweetsOutput.csv")
    val bw = new BufferedWriter(new FileWriter(file))
    bw.write("bounding_box,sentiment")
    bw.newLine()
    for (tuple <- results) {
      val bounding_box = tuple.asInstanceOf[Tuple].getField[String]("bounding_box")
      val sentiment = tuple.asInstanceOf[Tuple].getField[Int]("sentiment")
      bw.write("\"" + bounding_box + "\"," + sentiment)
      bw.newLine()
    }
    bw.flush()
    bw.close()
    results.toArray
  }

  override def open(): Unit = {}

  override def close(): Unit = {}

  override def processTuple(
      tuple: Either[ITuple, InputExhausted],
      input: LinkIdentity
  ): scala.Iterator[ITuple] = {
    tuple match {
      case Left(t) =>
        this.results += t
        Iterator()
      case Right(_) =>
        Iterator()
    }
  }

}
