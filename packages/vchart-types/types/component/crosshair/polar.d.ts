import type { IComponentOption } from '../interface';
import { ComponentTypeEnum } from '../interface/type';
import type { IPolarCrosshairSpec } from './interface';
import { BaseCrossHair } from './base';
import type { Maybe } from '@visactor/vutils';
import type { IGraphic } from '@visactor/vrender-core';
import type { IModelSpecInfo } from '../../model/interface';
export declare class PolarCrossHair<T extends IPolarCrosshairSpec = IPolarCrosshairSpec> extends BaseCrossHair<T> {
    static specKey: string;
    static type: ComponentTypeEnum;
    type: ComponentTypeEnum;
    name: string;
    private _currValueAngle;
    private _currValueRadius;
    private _angleHair;
    private _radiusHair;
    private _cacheAngleCrossHairInfo;
    private _cacheRadiusCrossHairInfo;
    private _radiusCrosshair;
    private _radiusLabelCrosshair;
    private _angleCrosshair;
    private _angleLabelCrosshair;
    static getSpecInfo(chartSpec: any): Maybe<IModelSpecInfo[]>;
    constructor(spec: T, options: IComponentOption);
    protected _showDefaultCrosshairBySpec(): void;
    private _defaultCrosshair;
    hide(): void;
    private _findAllAxisContains;
    private _getAllAxisValues;
    private _getValueByAxis;
    protected _layoutCrosshair(relativeX: number, relativeY: number): void;
    layoutByValue(tag?: number): void;
    private _layoutVertical;
    private _layoutHorizontal;
    protected _parseFieldInfo(): void;
    private _updateCrosshairLabel;
    protected _getNeedClearVRenderComponents(): IGraphic[];
}
export declare const registerPolarCrossHair: () => void;
