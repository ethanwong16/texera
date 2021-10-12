package edu.uci.ics.texera.workflow.operators.split

import com.fasterxml.jackson.annotation.{JsonProperty, JsonPropertyDescription}
import com.google.common.base.Preconditions
import edu.uci.ics.texera.workflow.common.metadata.{
  InputPort,
  OperatorGroupConstants,
  OperatorInfo,
  OutputPort
}
import edu.uci.ics.texera.workflow.common.metadata.annotations.AutofillAttributeName
import edu.uci.ics.texera.workflow.common.operators.OneToOneOpExecConfig
import edu.uci.ics.texera.workflow.common.operators.flatmap.FlatMapOpDesc
import edu.uci.ics.texera.workflow.common.tuple.schema.{OperatorSchemaInfo, Schema}

class SplitOpDesc extends FlatMapOpDesc {
  @JsonProperty(value = "delimiter", required = true)
  @JsonPropertyDescription("string that separates the data")
  var delimiter: String = _

  @JsonProperty(value = "attribute", required = true)
  @JsonPropertyDescription("column to split")
  @AutofillAttributeName
  var attribute: String = _

  override def operatorInfo: OperatorInfo =
    OperatorInfo(
      userFriendlyName = "Split",
      operatorDescription =
        "Split values in the column separated by a delimiter to multiple values",
      operatorGroupName = OperatorGroupConstants.UTILITY_GROUP,
      inputPorts = List(InputPort()),
      outputPorts = List(OutputPort())
    )

  override def operatorExecutor(operatorSchemaInfo: OperatorSchemaInfo): OneToOneOpExecConfig = {
    new OneToOneOpExecConfig(operatorIdentifier, _ => new SplitOpExec(this, operatorSchemaInfo))
  }

  override def getOutputSchema(schemas: Array[Schema]): Schema = {
    Preconditions.checkArgument(schemas.forall(_ == schemas(0)))
    schemas(0)
  }
}
