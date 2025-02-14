import type { IComponentOption } from '../interface';
import { ComponentTypeEnum } from '../interface/type';
import type { IRegion } from '../../region/interface';
import type { IModelInitOption, IModelSpecInfo } from '../../model/interface';
import type { IComponentMark } from '../../mark/interface';
import type { ILabel, IMark as IVGrammarMark } from '@visactor/vgrammar-core';
import { BaseLabelComponent } from './base-label';
import type { Maybe } from '@visactor/vutils';
import type { ILabelInfo } from './interface';
import type { IChartSpecInfo } from '../../chart/interface';
import type { IChartSpec } from '../../typings';
import { LabelSpecTransformer } from './label-transformer';
import type { IGraphic } from '@visactor/vrender-core';
export declare class Label<T extends IChartSpec = any> extends BaseLabelComponent<T> {
    static type: ComponentTypeEnum;
    type: ComponentTypeEnum;
    name: string;
    static specKey: string;
    specKey: string;
    static readonly transformerConstructor: any;
    readonly transformerConstructor: typeof LabelSpecTransformer;
    layoutZIndex: number;
    protected _labelInfoMap: Map<IRegion, ILabelInfo[]>;
    protected _labelComponentMap: Map<IComponentMark, () => ILabelInfo | ILabelInfo[]>;
    protected _layoutRule: 'series' | 'region';
    constructor(spec: T, options: IComponentOption);
    static getSpecInfo(chartSpec: any, chartSpecInfo: IChartSpecInfo): Maybe<IModelSpecInfo[]>;
    init(option: IModelInitOption): void;
    reInit(spec?: T): void;
    initEvent(): void;
    protected _initTextMark(): void;
    protected _initLabelComponent(): void;
    protected _initTextMarkStyle(): void;
    updateLayoutAttribute(): void;
    protected _updateMultiLabelAttribute(labelInfo: ILabelInfo[], labelComponent: IComponentMark): void;
    protected _updateSingleLabelAttribute(labelInfo: ILabelInfo, labelComponent: IComponentMark): void;
    protected _updateLabelComponentAttribute(component: ILabel, target: IVGrammarMark | IVGrammarMark[], labelInfos: ILabelInfo[]): void;
    compileMarks(): void;
    getVRenderComponents(): any[];
    getLabelInfoByTextGraphic(text: IGraphic): ILabelInfo;
}
export declare const registerLabel: () => void;
