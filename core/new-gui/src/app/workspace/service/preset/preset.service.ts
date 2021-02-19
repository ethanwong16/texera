import { Injectable } from '@angular/core';
import * as ajv from 'ajv';
import * as Ajv from 'ajv';
import { JSONSchema7 } from 'json-schema';
import { cloneDeep, merge } from 'lodash';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, Subject } from 'rxjs';
import { DictionaryService, UserDictionary } from 'src/app/common/service/user/user-dictionary/dictionary.service';
import { OperatorPredicate } from '../../types/workflow-common.interface';
import { DynamicSchemaService } from '../dynamic-schema/dynamic-schema.service';
import { OperatorMetadataService } from '../operator-metadata/operator-metadata.service';
import { WorkflowActionService } from '../workflow-graph/model/workflow-action.service';

type AlertMessageType = 'success' | 'error' | 'info' | 'warning';

const PresetSchema: JSONSchema7 = {
  type: "object",
  additionalProperties: {
    type: "string"
  }
}

const PresetArraySchema: JSONSchema7 = {
  type: "array",
  items: PresetSchema,
  uniqueItems: true,
}

export type Preset = {[key: string]: string|number|boolean};

export type PresetDictionary = {
  [Key: string]: Preset[]
}
@Injectable({
  providedIn: 'root'
})
export class PresetService {
  private static DICT_PREFIX = 'Preset';
  private static ajv = new Ajv();
  private static isPreset = PresetService.ajv.compile(PresetSchema);
  private static isPresetArray = PresetService.ajv.compile(PresetArraySchema);

  public readonly applyPresetStream: Observable<{type: string, target: string, preset: Preset}>;
  public readonly savePresetsStream: Observable<{type: string, target: string, presets: Preset[]}>;
  public presetDict: PresetDictionary;

  private applyPresetSubject = new Subject<{type: string, target: string, preset: Preset}>();
  private savePresetSubject = new Subject<{type: string, target: string, presets: Preset[]}>();


  constructor(
    private dictionaryService: DictionaryService,
    private messageService: NzMessageService,
    ) {
    this.applyPresetStream = this.applyPresetSubject.asObservable();
    this.savePresetsStream = this.savePresetSubject.asObservable();
    this.presetDict = this.getPresetDict();
    console.log('debug presetservice', this);
  }

  public applyPreset(type: string, target: string, preset: Preset) {
    this.applyPresetSubject.next({type: type, target: target, preset: preset});
  }

  public savePresets(type: string, target: string, presets: Preset[],
    displayMessage?: string|null, messageType: AlertMessageType = 'success') {

    this.presetDict[`${type}-${target}`] = presets;
    this.savePresetSubject.next({type: type, target: target, presets: presets});
    this.displaySavePresetMessage(messageType, displayMessage);
  }

  public getPresets(type: string, target: string): Readonly<Preset[]> {
    const presets = this.presetDict[`${type}-${target}`] ?? [];
    console.log(presets);
    if (this.isPresetArray(presets)) {
      return presets;
    } else {
      throw new Error(`stored preset data ${presets} is formatted incorrectly`);
    }
  }

  private getPresetDict(): PresetDictionary {
    const dict = this.dictionaryService.forceGetUserDictionary();
    return new Proxy(dict, {
      get(target: UserDictionary, key: string) {
        return (JSON.parse(target[`${PresetService.DICT_PREFIX}-${key}`]));
      },
      set(target: UserDictionary, key: string, value: Preset[]) {
        target[`${PresetService.DICT_PREFIX}-${key}`] = JSON.stringify(value);
        return true;
      },
      deleteProperty(target: UserDictionary, key: string) {
        delete target[`${PresetService.DICT_PREFIX}-${key}`];
        return true;
      },
      defineProperty(target: UserDictionary, key: string, attr: PropertyDescriptor) {
        target[`${PresetService.DICT_PREFIX}-${key}`] = JSON.stringify(attr.value);
        return true;
      },
      has(target: UserDictionary, key: string) {
        return `${PresetService.DICT_PREFIX}-${key}` in target;
      },
    }) as unknown as PresetDictionary;
  }

  private isPresetArray(presets: any[]): presets is Preset[] {
    return (PresetService.isPresetArray(presets) as boolean)
  }

  private displaySavePresetMessage(messageType: AlertMessageType, displayMessage?: string|null) {
    if (displayMessage === undefined) {
      switch (messageType) {
        case 'error':
          this.messageService.error('Preset deleted');
          break;
        case 'info':
          throw new Error(`no default save preset info message`);
          // break;
        case 'success':
          this.messageService.success('Preset saved');
          break;
        case 'warning':
          throw new Error(`no default save preset warning message`);
          // break;
      }
    } else if (displayMessage === null) {
      // do not display explicitly null message
      return;
    } else {
      switch (messageType) {
        case 'error':
          this.messageService.error(displayMessage);
          break;
        case 'info':
          this.messageService.info(displayMessage);
          break;
        case 'success':
          this.messageService.success(displayMessage);
          break;
        case 'warning':
          this.messageService.warning(displayMessage);
          break;
      }
    }
  }
}
