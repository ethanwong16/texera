package edu.uci.ics.texera.workflow.operators.split

import edu.uci.ics.texera.workflow.common.tuple.Tuple
import edu.uci.ics.texera.workflow.common.tuple.schema.{Attribute, AttributeType, Schema}
import org.scalatest.BeforeAndAfter
import org.scalatest.flatspec.AnyFlatSpec
import edu.uci.ics.texera.workflow.common.tuple.schema.OperatorSchemaInfo

class SplitOpExecSpec extends AnyFlatSpec with BeforeAndAfter{
  val tupleSchema: Schema = Schema
    .newBuilder()
    .add(new Attribute("field1", AttributeType.STRING))
    .add(new Attribute("field2", AttributeType.INTEGER))
    .add(new Attribute("field3", AttributeType.BOOLEAN))
    .build()

  val tuple: Tuple = Tuple
    .newBuilder(tupleSchema)
    .add(new Attribute("field1", AttributeType.STRING), "a-b-c")
    .add(new Attribute("field2", AttributeType.INTEGER), 1)
    .add(
      new Attribute("field3", AttributeType.BOOLEAN),
      true
    )
    .build()

  var opExec: SplitOpExec = _
  var opDesc: SplitOpDesc = _

  before {
    opDesc = new SplitOpDesc()
    opDesc.attribute = "field1"
    opDesc.delimiter = "-"
    opDesc.resultAttribute = "split"
    val outputSchema : Schema = opDesc.getOutputSchema(Array(tupleSchema))
    val operatorSchemaInfo: OperatorSchemaInfo = OperatorSchemaInfo(Array(tupleSchema), outputSchema)
    opExec = new SplitOpExec(opDesc, operatorSchemaInfo)
  }

  it should "open" in {
    opExec.open()
  }

  it should "splits value in the given attribute and output the split result in the result attribute, one for each tuple" in {
    opExec.open()
    val processedTuple = opExec.processTexeraTuple(Left(tuple), null)
    assert(processedTuple.next().getField("split").equals("a"))
    assert(processedTuple.next().getField("split").equals("b"))
    assert(processedTuple.next().getField("split").equals("c"))
    assertThrows[java.util.NoSuchElementException](processedTuple.next().getField("split"))
    opExec.close()
  }
}
