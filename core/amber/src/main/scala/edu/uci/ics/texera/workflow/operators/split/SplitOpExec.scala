package edu.uci.ics.texera.workflow.operators.split

import edu.uci.ics.texera.workflow.common.operators.flatmap.FlatMapOpExec
import edu.uci.ics.texera.workflow.common.tuple.Tuple
import edu.uci.ics.texera.workflow.common.tuple.schema.{AttributeType, OperatorSchemaInfo}

class SplitOpExec(val opDesc: SplitOpDesc, val operatorSchemaInfo: OperatorSchemaInfo)
    extends FlatMapOpExec {

  def splitByDelimiter(tuple: Tuple): Iterator[Tuple] = {

    val tupleValue = tuple.getField(opDesc.attribute).toString
    val tupleDelimiter = tuple.getField(opDesc.delimiter).toString

    val splitData = tupleValue.split(tupleDelimiter).toIterator

    splitData.map(split => {
      Tuple
        .newBuilder(operatorSchemaInfo.outputSchema)
        .add(tuple)
        .add("split", AttributeType.STRING, split)
        .build()
    })
  }
  setFlatMapFunc(splitByDelimiter)
}
