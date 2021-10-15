import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from "@angular/core";
import { ExecuteWorkflowService } from "../../../service/execute-workflow/execute-workflow.service";
import { ReplaySubject, Subject } from "rxjs";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig, FormlyFormOptions } from "@ngx-formly/core";
import * as Ajv from "ajv";
import { FormlyJsonschema } from "@ngx-formly/core/json-schema";
import { WorkflowActionService } from "../../../service/workflow-graph/model/workflow-action.service";
import { cloneDeep, isEqual, every, findIndex } from "lodash-es";
import { CustomJSONSchema7 } from "../../../types/custom-json-schema.interface";
import { isDefined } from "../../../../common/util/predicate";
import { ExecutionState } from "src/app/workspace/types/execute-workflow.interface";
import { DynamicSchemaService } from "../../../service/dynamic-schema/dynamic-schema.service";
import {
  SchemaAttribute,
  SchemaPropagationService,
} from "../../../service/dynamic-schema/schema-propagation/schema-propagation.service";
import {
  createOutputFormChangeEventStream,
  setChildTypeDependency,
  setHideExpression,
} from "src/app/common/formly/formly-utils";
import {
  TYPE_CASTING_OPERATOR_TYPE,
  TypeCastingDisplayComponent,
} from "../typecasting-display/type-casting-display.component";
import { DynamicComponentConfig } from "../../../../common/type/dynamic-component-config";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { filter, takeUntil } from "rxjs/operators";
import { NotificationService } from "../../../../common/service/notification/notification.service";
import { Preset, PresetService } from "src/app/workspace/service/preset/preset.service";
import { isType, nonNull } from "src/app/common/util/assert";
import { OperatorMetadataService } from "src/app/workspace/service/operator-metadata/operator-metadata.service";
import { PresetWrapperComponent } from "src/app/common/formly/preset-wrapper/preset-wrapper.component";

export type PropertyDisplayComponent = TypeCastingDisplayComponent;

export type PropertyDisplayComponentConfig = DynamicComponentConfig<PropertyDisplayComponent>;

/**
 * Property Editor uses JSON Schema to automatically generate the form from the JSON Schema of an operator.
 * For example, the JSON Schema of Sentiment Analysis could be:
 *  'properties': {
 *    'attribute': { 'type': 'string' },
 *    'resultAttribute': { 'type': 'string' }
 *  }
 * The automatically generated form will show two input boxes, one titled 'attribute' and one titled 'resultAttribute'.
 * More examples of the operator JSON schema can be found in `mock-operator-metadata.data.ts`
 * More about JSON Schema: Understanding JSON Schema - https://spacetelescope.github.io/understanding-json-schema/
 *
 * OperatorMetadataService will fetch metadata about the operators, which includes the JSON Schema, from the backend.
 *
 * We use library `@ngx-formly` to generate form from json schema
 * https://github.com/ngx-formly/ngx-formly
 */
@UntilDestroy()
@Component({
  selector: "texera-formly-form-frame",
  templateUrl: "./operator-property-edit-frame.component.html",
  styleUrls: ["./operator-property-edit-frame.component.scss"],
})
export class OperatorPropertyEditFrameComponent implements OnInit, OnChanges {
  @Input() currentOperatorId?: string;

  // re-declare enum for angular template to access it
  readonly ExecutionState = ExecutionState;

  // whether the editor can be edited
  interactive: boolean = this.evaluateInteractivity();

  // the source event stream of form change triggered by library at each user input
  sourceFormChangeEventStream = new Subject<Record<string, unknown>>();

  // the output form change event stream after debounce time and filtering out values
  operatorPropertyChangeStream = createOutputFormChangeEventStream(this.sourceFormChangeEventStream, data =>
    this.checkOperatorProperty(data)
  );

  // inputs and two-way bindings to formly component
  formlyFormGroup: FormGroup | undefined;
  formData: any;
  formlyOptions: FormlyFormOptions | undefined;
  formlyFields: FormlyFieldConfig[] | undefined;
  formTitle: string | undefined;

  editingTitle: boolean = false;

  // used to fill in default values in json schema to initialize new operator
  ajv = new Ajv({ useDefaults: true });

  // for display component of some extra information
  extraDisplayComponentConfig?: PropertyDisplayComponentConfig;

  // vars used in form preset feature. TODO: separate this logic into it's own mini-service
  @ViewChild("promptSavePresetDialogButton") promptSaveDialogButton?: ElementRef<HTMLAnchorElement>;
  public presetContext = {
    hasPresetFields: false,
    showPrompt: false,
    resolvePrompt: (ok: boolean) => {},
    promptResult: Promise.resolve(false),
    originalPreset: <Preset | null>null,
  };

  // used to tear down subscriptions that takeUntil(teardownObservable)
  private teardownObservable: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private formlyJsonschema: FormlyJsonschema,
    private workflowActionService: WorkflowActionService,
    public executeWorkflowService: ExecuteWorkflowService,
    private dynamicSchemaService: DynamicSchemaService,
    private schemaPropagationService: SchemaPropagationService,
    private notificationService: NotificationService,
    private operatorMetadataService: OperatorMetadataService,
    private presetService: PresetService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.currentOperatorId = changes.currentOperatorId?.currentValue;
    if (!this.currentOperatorId) {
      return;
    }
    this.rerenderEditorForm();
  }

  switchDisplayComponent(targetConfig?: PropertyDisplayComponentConfig) {
    if (
      this.extraDisplayComponentConfig?.component === targetConfig?.component &&
      this.extraDisplayComponentConfig?.component === targetConfig?.componentInputs
    ) {
      return;
    }

    this.extraDisplayComponentConfig = targetConfig;
  }

  ngOnInit(): void {
    // listen to the autocomplete event, remove invalid properties, and update the schema displayed on the form
    this.registerOperatorSchemaChangeHandler();

    // when the operator's property is updated via program instead of user updating the json schema form,
    //  this observable will be responsible in handling these events.
    this.registerOperatorPropertyChangeHandler();

    // handle the form change event on the user interface to actually set the operator property
    this.registerOnFormChangeHandler();

    this.registerDisableEditorInteractivityHandler();

    // handle applying presets
    this.handleApplyPreset();
  }

  /**
   * Callback function provided to the Angular Json Schema Form library,
   *  whenever the form data is changed, this function is called.
   * It only serves as a bridge from a callback function to RxJS Observable
   * @param event
   */
  onFormChanges(event: Record<string, unknown>): void {
    this.sourceFormChangeEventStream.next(event);
  }

  /**
   * Changes the property editor to use the new operator data.
   * Sets all the data needed by the json schema form and displays the form.
   */
  rerenderEditorForm(): void {
    if (!this.currentOperatorId) {
      return;
    }
    const operator = this.workflowActionService.getTexeraGraph().getOperator(this.currentOperatorId);
    // set the operator data needed
    const currentOperatorSchema = this.dynamicSchemaService.getDynamicSchema(this.currentOperatorId);
    this.setFormlyFormBinding(currentOperatorSchema.jsonSchema);
    this.formTitle = operator.customDisplayName ?? currentOperatorSchema.additionalMetadata.userFriendlyName;

    /**
     * Important: make a deep copy of the initial property data object.
     * Prevent the form directly changes the value in the texera graph without going through workflow action service.
     */
    this.formData = cloneDeep(operator.operatorProperties);

    // if form has preset fields, setup presetContext
    const form_has_preset_fields = Object.values(nonNull(currentOperatorSchema.jsonSchema.properties)).some(
      property => !isType(property, "boolean") && property["enable-presets"]
    );
    if (form_has_preset_fields) {
      const startingPreset = this.filterPresetFromForm(operator.operatorType, this.formData);
      const presets = this.presetService.getPresets("operator", operator.operatorType);
      const presetIndex = findIndex(presets, preset => isEqual(preset, startingPreset));

      this.presetContext.hasPresetFields = true;
      this.presetContext.originalPreset = presetIndex === -1 ? null : startingPreset;
    }

    // use ajv to initialize the default value to data according to schema, see https://ajv.js.org/#assigning-defaults
    // WorkflowUtil service also makes sure that the default values are filled in when operator is added from the UI
    // However, we perform an addition check for the following reasons:
    // 1. the operator might be added not directly from the UI, which violates the precondition
    // 2. the schema might change, which specifies a new default value
    // 3. formly doesn't emit change event when it fills in default value, causing an inconsistency between component and service
    this.ajv.validate(currentOperatorSchema, this.formData);

    // manually trigger a form change event because default value might be filled in
    this.onFormChanges(this.formData);

    if (
      this.workflowActionService
        .getTexeraGraph()
        .getOperator(this.currentOperatorId)
        .operatorType.includes(TYPE_CASTING_OPERATOR_TYPE)
    ) {
      this.switchDisplayComponent({
        component: TypeCastingDisplayComponent,
        componentInputs: { currentOperatorId: this.currentOperatorId },
      });
    } else {
      this.switchDisplayComponent(undefined);
    }
    // execute set interactivity immediately in another task because of a formly bug
    // whenever the form model is changed, formly can only disable it after the UI is rendered
    setTimeout(() => {
      const interactive = this.evaluateInteractivity();
      this.setInteractivity(interactive);
    }, 0);
  }

  evaluateInteractivity(): boolean {
    return [ExecutionState.Uninitialized, ExecutionState.Completed].includes(
      this.executeWorkflowService.getExecutionState().state
    );
  }

  setInteractivity(interactive: boolean) {
    this.interactive = interactive;
    if (this.formlyFormGroup !== undefined) {
      if (this.interactive) {
        this.formlyFormGroup.enable();
      } else {
        this.formlyFormGroup.disable();
      }
    }
  }

  checkOperatorProperty(formData: object): boolean {
    // check if the component is displaying operator property
    if (this.currentOperatorId === undefined) {
      return false;
    }
    // check if the operator still exists, it might be deleted during debounce time
    const operator = this.workflowActionService.getTexeraGraph().getOperator(this.currentOperatorId);
    if (!operator) {
      return false;
    }
    // only emit change event if the form data actually changes
    return !isEqual(formData, operator.operatorProperties);
  }

  /**
   * This method handles the schema change event from autocomplete. It will get the new schema
   *  propagated from autocomplete and check if the operators' properties that users input
   *  previously are still valid. If invalid, it will remove these fields and triggered an event so
   *  that the user interface will be updated through registerOperatorPropertyChangeHandler() method.
   *
   * If the operator that experiences schema changed is the same as the operator that is currently
   *  displaying on the property panel, this handler will update the current operator schema
   *  to the new schema.
   */
  registerOperatorSchemaChangeHandler(): void {
    this.dynamicSchemaService
      .getOperatorDynamicSchemaChangedStream()
      .pipe(filter(({ operatorID }) => operatorID === this.currentOperatorId))
      .pipe(untilDestroyed(this))
      .subscribe(_ => this.rerenderEditorForm());
  }

  /**
   * This method captures the change in operator's property via program instead of user updating the
   *  json schema form in the user interface.
   *
   * For instance, when the input doesn't matching the new json schema and the UI needs to remove the
   *  invalid fields, this form will capture those events.
   */
  registerOperatorPropertyChangeHandler(): void {
    this.workflowActionService
      .getTexeraGraph()
      .getOperatorPropertyChangeStream()
      .pipe(
        filter(_ => this.currentOperatorId !== undefined),
        filter(operatorChanged => operatorChanged.operator.operatorID === this.currentOperatorId),
        filter(operatorChanged => !isEqual(this.formData, operatorChanged.operator.operatorProperties))
      )
      .pipe(untilDestroyed(this))
      .subscribe(operatorChanged => (this.formData = cloneDeep(operatorChanged.operator.operatorProperties)));
  }

  /**
   * This method handles the form change event and set the operator property
   *  in the texera graph.
   */
  registerOnFormChangeHandler(): void {
    this.operatorPropertyChangeStream.pipe(untilDestroyed(this)).subscribe(formData => {
      // set the operator property to be the new form data
      if (this.currentOperatorId) {
        this.workflowActionService.setOperatorProperty(this.currentOperatorId, cloneDeep(formData));
      }
    });
  }

  registerDisableEditorInteractivityHandler(): void {
    this.executeWorkflowService
      .getExecutionStateStream()
      .pipe(untilDestroyed(this))
      .subscribe(event => {
        if (this.currentOperatorId) {
          const interactive = this.evaluateInteractivity();
          this.setInteractivity(interactive);
        }
      });
  }

  setFormlyFormBinding(schema: CustomJSONSchema7) {
    // intercept JsonSchema -> FormlySchema process, adding custom options
    // this requires a one-to-one mapping.
    // for relational custom options, have to do it after FormlySchema is generated.
    const jsonSchemaMapIntercept = (
      mappedField: FormlyFieldConfig,
      mapSource: CustomJSONSchema7
    ): FormlyFieldConfig => {
      // if the title is python script (for Python UDF), then make this field a custom template 'codearea'
      if (mapSource?.description?.toLowerCase() === "input your code here") {
        if (mappedField.type) {
          mappedField.type = "codearea";
        }
      }
      // if presetService is ready and operator property allows presets, setup formly field to display presets
      if (
        this.presetService.ready.value === true &&
        mapSource["enable-presets"] !== undefined &&
        this.currentOperatorId !== undefined
      ) {
        PresetWrapperComponent.setupFieldConfig(
          mappedField,
          "operator",
          this.workflowActionService.getTexeraGraph().getOperator(this.currentOperatorId).operatorType,
          this.currentOperatorId
        );
      }
      return mappedField;
    };

    this.formlyFormGroup = new FormGroup({});
    this.formlyOptions = {};
    // convert the json schema to formly config, pass a copy because formly mutates the schema object
    const field = this.formlyJsonschema.toFieldConfig(cloneDeep(schema), {
      map: jsonSchemaMapIntercept,
    });
    field.hooks = {
      onInit: fieldConfig => {
        if (!this.interactive) {
          fieldConfig?.form?.disable();
        }
      },
    };

    const schemaProperties = schema.properties;
    const fields = field.fieldGroup;

    // adding custom options, relational N-to-M mapping.
    if (schemaProperties && fields) {
      Object.entries(schemaProperties).forEach(([propertyName, propertyValue]) => {
        if (typeof propertyValue === "boolean") {
          return;
        }
        if (propertyValue.toggleHidden) {
          setHideExpression(propertyValue.toggleHidden, fields, propertyName);
        }

        if (propertyValue.dependOn) {
          if (isDefined(this.currentOperatorId)) {
            const attributes: ReadonlyArray<ReadonlyArray<SchemaAttribute> | null> | undefined =
              this.schemaPropagationService.getOperatorInputSchema(this.currentOperatorId);
            setChildTypeDependency(attributes, propertyValue.dependOn, fields, propertyName);
          }
        }
      });
    }

    this.formlyFields = fields;
  }

  allowModifyOperatorLogic(): void {
    this.setInteractivity(true);
  }

  confirmModifyOperatorLogic(): void {
    if (this.currentOperatorId) {
      try {
        this.executeWorkflowService.modifyOperatorLogic(this.currentOperatorId);
        this.setInteractivity(false);
      } catch (e: any) {
        this.notificationService.error(e);
      }
    }
  }

  confirmChangeOperatorCustomName(customDisplayName: string) {
    if (this.currentOperatorId) {
      const currentOperatorSchema = this.dynamicSchemaService.getDynamicSchema(this.currentOperatorId);

      // fall back to the original userFriendlyName if no valid name is provided
      const newDisplayName =
        customDisplayName === "" || customDisplayName === undefined
          ? currentOperatorSchema.additionalMetadata.userFriendlyName
          : customDisplayName;
      this.workflowActionService.getTexeraGraph().changeOperatorDisplayName(this.currentOperatorId, newDisplayName);
      this.formTitle = newDisplayName;
    }

    this.editingTitle = false;
  }

  promptSavePreset(): Promise<boolean> {
    // init presetContext for dialog to bind to
    this.presetContext.promptResult = new Promise<boolean>(_resolve => {
      this.presetContext.resolvePrompt = _resolve;
    });

    // show dialog
    this.presetContext.showPrompt = true;
    nonNull(this.promptSaveDialogButton).nativeElement.click();

    // handle dialog results
    this.presetContext.promptResult.then((save: boolean) => {
      this.presetContext.showPrompt = false;
      if (save === true) {
        this.saveOperatorPresets();
      }
    });

    return this.presetContext.promptResult;
  }

  /**
   * attempts to save current property editor form data as an operator preset
   */
  saveOperatorPresets() {
    if (
      this.currentOperatorId === undefined ||
      this.formData === undefined ||
      this.presetContext.hasPresetFields === false
    ) {
      throw Error("Attempted to save operator preset when no preset is available");
    }

    const operatorType = this.operatorMetadataService.getOperatorSchema(
      this.workflowActionService.getTexeraGraph().getOperator(this.currentOperatorId).operatorType
    ).operatorType;
    const newPreset = this.filterPresetFromForm(operatorType, this.formData);
    let presets = this.presetService.getPresets("operator", operatorType).slice(); // shallow copy

    const preset_is_valid = this.presetService.isValidOperatorPreset(newPreset, this.currentOperatorId);
    const preset_is_not_a_repeat = every(presets, preset => !isEqual(preset, newPreset));
    const preset_is_an_edit = this.presetContext.originalPreset !== null;

    if (!preset_is_valid) throw Error(`Attempted to save invalid preset ${newPreset}`);
    if (!preset_is_not_a_repeat) throw Error(`Attempted to save preset ${newPreset} that already exists`);
    if (preset_is_an_edit) presets = presets.filter(preset => !isEqual(preset, this.presetContext.originalPreset));

    presets.push(newPreset);
    this.presetService.savePresets("operator", operatorType, presets);
  }

  /**
   * resets PropertyEditor so that something else can be edited
   * If it was editing an operator, check if a preset was should be created/saved
   */
  public async resetPropertyEditor() {
    const form_is_dirty = this.formlyFields !== undefined && this.formlyFields.some(field => field.formControl?.dirty);
    const form_has_preset_fields = this.presetContext.hasPresetFields;
    const form_preset_is_an_edit = this.presetContext.originalPreset !== null;
    const form_preset_is_valid =
      this.currentOperatorId !== undefined &&
      form_has_preset_fields &&
      this.presetService.isValidNewOperatorPreset(
        this.filterPresetFromForm(
          this.operatorMetadataService.getOperatorSchema(
            // there should be an easier way to get operator schema from operator ID, but I don't know how
            this.workflowActionService.getTexeraGraph().getOperator(this.currentOperatorId).operatorType
          ).operatorType,
          this.formData
        ),
        this.currentOperatorId
      );

    if (this.presetService.ready.value === true && form_has_preset_fields && form_is_dirty && form_preset_is_valid) {
      if (form_preset_is_an_edit) this.saveOperatorPresets();
      else await this.promptSavePreset(); // form preset is novel, prompt user to save it
    }
  }

  handleApplyPreset(): void {
    this.presetService.applyPresetStream.pipe(takeUntil(this.teardownObservable)).subscribe({
      next: applyEvent => {
        if (
          this.currentOperatorId !== undefined &&
          this.currentOperatorId === applyEvent.target &&
          this.presetService.isValidOperatorPreset(applyEvent.preset, this.currentOperatorId)
        ) {
          this.presetContext.originalPreset = applyEvent.preset;
        }
      },
    });
  }

  /**
   * Filters formData to only include members that are in the preset schema of the given operatorType
   * @param operatorType
   * @param formData
   * @returns partially finished Preset. use PresetService.isValidOperatorPreset to verify all preset attributes exist
   */
  filterPresetFromForm(operatorType: string, formData: object): Preset {
    return PresetService.filterOperatorPresetProperties(
      this.operatorMetadataService.getOperatorSchema(operatorType).jsonSchema,
      this.formData
    );
  }
}
