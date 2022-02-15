// Generated by the Scala Plugin for the Protocol Buffer Compiler.
// Do not edit!
//
// Protofile syntax: PROTO3

package edu.uci.ics.amber.engine.architecture.worker.workloadmetrics

@SerialVersionUID(0L)
final case class SelfWorkloadReturn(
    metrics: edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadMetrics,
    samples: _root_.scala.Seq[edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadSample]
    ) extends scalapb.GeneratedMessage with scalapb.lenses.Updatable[SelfWorkloadReturn] {
    @transient
    private[this] var __serializedSizeCachedValue: _root_.scala.Int = 0
    private[this] def __computeSerializedValue(): _root_.scala.Int = {
      var __size = 0
      
      {
        val __value = metrics
        if (__value != edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadMetrics.defaultInstance) {
          __size += 1 + _root_.com.google.protobuf.CodedOutputStream.computeUInt32SizeNoTag(__value.serializedSize) + __value.serializedSize
        }
      };
      samples.foreach { __item =>
        val __value = __item
        __size += 1 + _root_.com.google.protobuf.CodedOutputStream.computeUInt32SizeNoTag(__value.serializedSize) + __value.serializedSize
      }
      __size
    }
    override def serializedSize: _root_.scala.Int = {
      var read = __serializedSizeCachedValue
      if (read == 0) {
        read = __computeSerializedValue()
        __serializedSizeCachedValue = read
      }
      read
    }
    def writeTo(`_output__`: _root_.com.google.protobuf.CodedOutputStream): _root_.scala.Unit = {
      {
        val __v = metrics
        if (__v != edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadMetrics.defaultInstance) {
          _output__.writeTag(1, 2)
          _output__.writeUInt32NoTag(__v.serializedSize)
          __v.writeTo(_output__)
        }
      };
      samples.foreach { __v =>
        val __m = __v
        _output__.writeTag(2, 2)
        _output__.writeUInt32NoTag(__m.serializedSize)
        __m.writeTo(_output__)
      };
    }
    def withMetrics(__v: edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadMetrics): SelfWorkloadReturn = copy(metrics = __v)
    def clearSamples = copy(samples = _root_.scala.Seq.empty)
    def addSamples(__vs: edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadSample*): SelfWorkloadReturn = addAllSamples(__vs)
    def addAllSamples(__vs: Iterable[edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadSample]): SelfWorkloadReturn = copy(samples = samples ++ __vs)
    def withSamples(__v: _root_.scala.Seq[edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadSample]): SelfWorkloadReturn = copy(samples = __v)
    def getFieldByNumber(__fieldNumber: _root_.scala.Int): _root_.scala.Any = {
      (__fieldNumber: @_root_.scala.unchecked) match {
        case 1 => {
          val __t = metrics
          if (__t != edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadMetrics.defaultInstance) __t else null
        }
        case 2 => samples
      }
    }
    def getField(__field: _root_.scalapb.descriptors.FieldDescriptor): _root_.scalapb.descriptors.PValue = {
      _root_.scala.Predef.require(__field.containingMessage eq companion.scalaDescriptor)
      (__field.number: @_root_.scala.unchecked) match {
        case 1 => metrics.toPMessage
        case 2 => _root_.scalapb.descriptors.PRepeated(samples.iterator.map(_.toPMessage).toVector)
      }
    }
    def toProtoString: _root_.scala.Predef.String = _root_.scalapb.TextFormat.printToSingleLineUnicodeString(this)
    def companion = edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadReturn
    // @@protoc_insertion_point(GeneratedMessage[edu.uci.ics.amber.engine.architecture.worker.SelfWorkloadReturn])
}

object SelfWorkloadReturn extends scalapb.GeneratedMessageCompanion[edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadReturn] {
  implicit def messageCompanion: scalapb.GeneratedMessageCompanion[edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadReturn] = this
  def parseFrom(`_input__`: _root_.com.google.protobuf.CodedInputStream): edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadReturn = {
    var __metrics: _root_.scala.Option[edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadMetrics] = _root_.scala.None
    val __samples: _root_.scala.collection.immutable.VectorBuilder[edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadSample] = new _root_.scala.collection.immutable.VectorBuilder[edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadSample]
    var _done__ = false
    while (!_done__) {
      val _tag__ = _input__.readTag()
      _tag__ match {
        case 0 => _done__ = true
        case 10 =>
          __metrics = _root_.scala.Some(__metrics.fold(_root_.scalapb.LiteParser.readMessage[edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadMetrics](_input__))(_root_.scalapb.LiteParser.readMessage(_input__, _)))
        case 18 =>
          __samples += _root_.scalapb.LiteParser.readMessage[edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadSample](_input__)
        case tag => _input__.skipField(tag)
      }
    }
    edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadReturn(
        metrics = __metrics.getOrElse(edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadMetrics.defaultInstance),
        samples = __samples.result()
    )
  }
  implicit def messageReads: _root_.scalapb.descriptors.Reads[edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadReturn] = _root_.scalapb.descriptors.Reads{
    case _root_.scalapb.descriptors.PMessage(__fieldsMap) =>
      _root_.scala.Predef.require(__fieldsMap.keys.forall(_.containingMessage eq scalaDescriptor), "FieldDescriptor does not match message type.")
      edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadReturn(
        metrics = __fieldsMap.get(scalaDescriptor.findFieldByNumber(1).get).map(_.as[edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadMetrics]).getOrElse(edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadMetrics.defaultInstance),
        samples = __fieldsMap.get(scalaDescriptor.findFieldByNumber(2).get).map(_.as[_root_.scala.Seq[edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadSample]]).getOrElse(_root_.scala.Seq.empty)
      )
    case _ => throw new RuntimeException("Expected PMessage")
  }
  def javaDescriptor: _root_.com.google.protobuf.Descriptors.Descriptor = WorkloadmetricsProto.javaDescriptor.getMessageTypes().get(3)
  def scalaDescriptor: _root_.scalapb.descriptors.Descriptor = WorkloadmetricsProto.scalaDescriptor.messages(3)
  def messageCompanionForFieldNumber(__number: _root_.scala.Int): _root_.scalapb.GeneratedMessageCompanion[_] = {
    var __out: _root_.scalapb.GeneratedMessageCompanion[_] = null
    (__number: @_root_.scala.unchecked) match {
      case 1 => __out = edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadMetrics
      case 2 => __out = edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadSample
    }
    __out
  }
  lazy val nestedMessagesCompanions: Seq[_root_.scalapb.GeneratedMessageCompanion[_ <: _root_.scalapb.GeneratedMessage]] = Seq.empty
  def enumCompanionForFieldNumber(__fieldNumber: _root_.scala.Int): _root_.scalapb.GeneratedEnumCompanion[_] = throw new MatchError(__fieldNumber)
  lazy val defaultInstance = edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadReturn(
    metrics = edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadMetrics.defaultInstance,
    samples = _root_.scala.Seq.empty
  )
  implicit class SelfWorkloadReturnLens[UpperPB](_l: _root_.scalapb.lenses.Lens[UpperPB, edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadReturn]) extends _root_.scalapb.lenses.ObjectLens[UpperPB, edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadReturn](_l) {
    def metrics: _root_.scalapb.lenses.Lens[UpperPB, edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadMetrics] = field(_.metrics)((c_, f_) => c_.copy(metrics = f_))
    def samples: _root_.scalapb.lenses.Lens[UpperPB, _root_.scala.Seq[edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadSample]] = field(_.samples)((c_, f_) => c_.copy(samples = f_))
  }
  final val METRICS_FIELD_NUMBER = 1
  final val SAMPLES_FIELD_NUMBER = 2
  def of(
    metrics: edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadMetrics,
    samples: _root_.scala.Seq[edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadSample]
  ): _root_.edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadReturn = _root_.edu.uci.ics.amber.engine.architecture.worker.workloadmetrics.SelfWorkloadReturn(
    metrics,
    samples
  )
  // @@protoc_insertion_point(GeneratedMessageCompanion[edu.uci.ics.amber.engine.architecture.worker.SelfWorkloadReturn])
}
