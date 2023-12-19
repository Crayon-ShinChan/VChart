import type { Maybe } from '@visactor/vutils';
import type { IComponentOption } from '../interface';
import { ComponentTypeEnum } from '../interface/type';
import type { ICartesianCrosshairSpec } from './interface';
import { BaseCrossHair } from './base';
import type { IGraphic } from '@visactor/vrender-core';
import type { IAxis } from '../axis/interface';
import type { StringOrNumber } from '../../typings';
import type { IModelSpecInfo } from '../../model/interface';
export declare class CartesianCrossHair<T extends ICartesianCrosshairSpec = ICartesianCrosshairSpec> extends BaseCrossHair<T> {
    static specKey: string;
    static type: ComponentTypeEnum;
    type: ComponentTypeEnum;
    name: string;
    private _xHair;
    private _yHair;
    private _cacheXCrossHairInfo;
    private _cacheYCrossHairInfo;
    private _xCrosshair;
    private _xTopLabel;
    private _xBottomLabel;
    private _yCrosshair;
    private _yLeftLabel;
    private _yRightLabel;
    private _currValueX;
    private _currValueY;
    static getSpecInfo(chartSpec: any): Maybe<IModelSpecInfo[]>;
    constructor(spec: T, options: IComponentOption);
    protected _showDefaultCrosshairBySpec(): void;
    private _defaultCrosshair;
    private _findAllAxisContains;
    private _getValueAt;
    clearAxisValue(): void;
    setAxisValue(v: StringOrNumber, axis: IAxis): void;
    private _getAllAxisValues;
    protected _layoutCrosshair(relativeX: number, relativeY: number): void;
    hide(): void;
    layoutByValue(tag?: number): void;
    private _layoutVertical;
    private _layoutHorizontal;
    private _getRectSize;
    protected _parseFieldInfo(): void;
    private _updateCrosshair;
    private _updateCrosshairLabel;
    protected _getNeedClearVRenderComponents(): IGraphic[];
}
export declare const registerCartesianCrossHair: () => void;
