package edu.uci.ics.texera.workflow.operators.split

import edu.uci.ics.texera.workflow.common.operators.flatmap.FlatMapOpExec
import edu.uci.ics.texera.workflow.common.tuple.Tuple
import edu.uci.ics.texera.workflow.common.tuple.schema.{Attribute, AttributeType, OperatorSchemaInfo}

class SplitOpExec(opDesc: SplitOpDesc, operatorSchemaInfo: OperatorSchemaInfo)
    extends FlatMapOpExec {

  def splitByDelimiter(tuple: Tuple): Iterator[Tuple] = {

    val tupleValue = tuple.getField(this.opDesc.attribute).toString
    val splitData = tupleValue.split(this.opDesc.delimiter).toIterator

    splitData.map(split => {
      Tuple
        .newBuilder(operatorSchemaInfo.outputSchema)
        .add(tuple)
        .add(opDesc.resultAttribute, AttributeType.STRING, split)
        .build()
    })
  }
  setFlatMapFunc(splitByDelimiter)
}
