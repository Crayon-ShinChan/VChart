/* eslint-disable no-duplicate-imports */
import type { IPadding } from '@visactor/vutils';
import { isEqual, isValidNumber } from '@visactor/vutils';
import { isValid } from '@visactor/vutils';
import { AttributeLevel, DEFAULT_DATA_KEY, DEFAULT_DATA_SERIES_FIELD } from '../../constant';
import type { ITextMark } from '../../mark/text';
import type { SeriesMarkMap } from '../interface';
import { SeriesMarkNameEnum } from '../interface/type';
import { isTrueBrowser } from '../../util';
import {
  DEFAULT_DRAW_OUT_OF_BOUND,
  DEFAULT_FONTSIZE_RANGE,
  DEFAULT_FONT_PADDING,
  DEFAULT_FONT_WEIGHT_RANGE,
  DEFAULT_MASK_SHAPE,
  DEFAULT_MIN_FONT_SIZE,
  DEFAULT_RANDOM,
  DEFAULT_ROTATE_ANGLES,
  DEFAULT_ZOOM_TO_FIT,
  SHAPE_TYPE
} from './config';
import type {
  IWordCloudSeriesSpec,
  WordCloudConfigType,
  WordCloudShapeConfigType,
  WordCloudShapeType
} from './interface';
import { registerWordCloudTransforms } from '@visactor/vgrammar-wordcloud';
import { registerWordCloudShapeTransforms } from '@visactor/vgrammar-wordcloud-shape';
import type { Datum, IPoint } from '../../typings';
import { DEFAULT_MARK_ANIMATION } from '../../animation/config';
import { animationConfig, userAnimationConfig } from '../../animation/utils';
import { LinearScale } from '@visactor/vscale';
import { extent } from '@visactor/vgrammar-util';
import {
  WORD_CLOUD_ANGLE,
  WORD_CLOUD_FILLING_ANGLE,
  WORD_CLOUD_TEXT,
  WORD_CLOUD_WEIGHT
} from '../../constant/word-cloud';
import { getDataScheme } from '../../theme/color-scheme/util';
import type { ICompilableMark } from '../../compile/mark';
import { BaseSeries } from '../base/base-series';
import { ColorOrdinalScale } from '../../scale/color-ordinal-scale';
import { VChart } from '../../core/vchart';
import { TextMark } from '../../mark/text';
import { wordCloudSeriesMark } from './constant';
import type { IStateAnimateSpec } from '../../animation/spec';
import type { IMark } from '../../mark/interface';

VChart.useMark([TextMark]);

registerWordCloudTransforms();
registerWordCloudShapeTransforms();

export type IBaseWordCloudSeriesSpec = Omit<IWordCloudSeriesSpec, 'type'> & { type: string };

export class BaseWordCloudSeries<T extends IBaseWordCloudSeriesSpec = IBaseWordCloudSeriesSpec> extends BaseSeries<T> {
  static readonly mark: SeriesMarkMap = wordCloudSeriesMark;

  protected _nameField: string;
  protected _valueField?: string;
  setValueField(field: string) {
    if (isValid(field)) {
      this._valueField = field;
    }
  }

  protected _fontFamilyField: string;
  protected _fontWeightField: string;
  protected _fontStyleField: string;
  protected _colorHexField: string;
  protected _colorMode: 'linear' | 'ordinal';
  protected _colorList: string[];
  protected _rotateAngles?: number[];
  protected _fontWeightRange?: [number, number];

  protected _fontSizeRange?: [number, number] = [DEFAULT_MIN_FONT_SIZE, DEFAULT_MIN_FONT_SIZE];
  setFontSizeRange(fontSizeRange: [number, number]) {
    if (isValid(fontSizeRange)) {
      this._fontSizeRange = fontSizeRange;
    } else {
      this._fontSizeRange = DEFAULT_FONTSIZE_RANGE;
    }
  }

  protected _maskShape?: string | WordCloudShapeType;
  protected _isWordCloudShape: boolean = false;

  protected _keepAspect?: boolean;
  protected _random?: boolean;
  protected _fontPadding?: number;
  protected _fillingFontPadding?: number;
  protected _wordCloudConfig?: WordCloudConfigType;
  protected _wordCloudShapeConfig?: WordCloudShapeConfigType;

  protected _padding?: IPadding;

  /**
   * @override
   */
  setAttrFromSpec() {
    super.setAttrFromSpec();
    // series布局相关
    this._padding = this._option.getChart().padding;

    // 普通词云 & 形状词云 共有spec相关
    this._nameField = this._spec.nameField;
    this._fontFamilyField = this._spec.fontFamilyField;
    this._fontWeightField = this._spec.fontWeightField;
    this._fontStyleField = this._spec.fontStyleField;
    this._colorHexField = this._spec.colorHexField;
    this._colorMode = this._spec.colorMode ?? 'ordinal';
    this._colorList = this._spec.colorList;
    this.setValueField(this._spec.valueField);
    this._fontWeightRange = this._spec.fontWeightRange ?? DEFAULT_FONT_WEIGHT_RANGE;
    this._rotateAngles = this._spec.rotateAngles ?? DEFAULT_ROTATE_ANGLES;
    this.setFontSizeRange(this._spec.fontSizeRange);
    this._maskShape = this._spec.maskShape ?? DEFAULT_MASK_SHAPE;
    this._keepAspect = this._spec.keepAspect;
    this._random = this._spec.random ?? DEFAULT_RANDOM;
    this._fontPadding = this._spec?.word?.padding ?? this._theme?.wordCloud?.word?.padding ?? DEFAULT_FONT_PADDING;

    // 普通词云spec相关
    this._wordCloudConfig = {
      drawOutOfBound: DEFAULT_DRAW_OUT_OF_BOUND,
      layoutMode: 'default',
      zoomToFit: DEFAULT_ZOOM_TO_FIT,
      ...this._spec.wordCloudConfig
    };

    // 形状词云spec相关
    this._wordCloudShapeConfig = {
      fillingSeriesField: this.getSeriesField(),
      fillingRotateAngles: DEFAULT_ROTATE_ANGLES,
      layoutMode: 'default',
      ...this._spec?.wordCloudShapeConfig
    };
    this._fillingFontPadding =
      this._spec?.fillingWord?.padding ?? this._theme?.wordCloud?.fillingWord?.padding ?? DEFAULT_FONT_PADDING;

    this._isWordCloudShape = !SHAPE_TYPE.includes(this._maskShape);
  }

  protected _wordMark: ITextMark;
  protected _fillingWordMark: ITextMark;
  initMark(): void {
    this._wordMark = this._createMark(BaseWordCloudSeries.mark.word, {
      defaultMorphElementKey: this._seriesField,
      groupKey: this._seriesField,
      isSeriesMark: true
    }) as ITextMark;
    if (this._isWordCloudShape) {
      this._fillingWordMark = this._createMark(BaseWordCloudSeries.mark.fillingWord) as ITextMark;
    }
  }

  initMarkStyle() {
    const wordMark = this._wordMark;
    const fillingWordMark = this._fillingWordMark;
    const textField = this._spec.word?.formatMethod ? WORD_CLOUD_TEXT : this._nameField;
    if (wordMark) {
      this.setMarkStyle(
        wordMark,
        {
          fill: this._colorHexField
            ? (datum: Datum) => datum[this._colorHexField]
            : this.getWordColorAttribute(this._seriesField, false),
          text: (datum: Datum) => datum[textField],
          x: (datum: Datum) => datum.x,
          y: (datum: Datum) => datum.y,
          fontFamily: (datum: Datum) => datum.fontFamily,
          fontSize: (datum: Datum) => datum.fontSize,
          fontStyle: (datum: Datum) => datum.fontStyle,
          fontWeight: (datum: Datum) => datum.fontWeight,
          angle: (datum: Datum) => datum.angle,
          visible: (datum: Datum) => !datum.isFillingWord
        },
        'normal',
        AttributeLevel.Series
      );
      this.setMarkStyle(
        wordMark,
        {
          fontFamily: this._spec.word?.style?.fontFamily ?? this._option?.getTheme()?.fontFamily
        },
        'normal',
        AttributeLevel.User_Mark
      );
    }
    if (fillingWordMark) {
      this.setMarkStyle(
        fillingWordMark,
        {
          fill: this._wordCloudShapeConfig.fillingColorHexField
            ? (datum: Datum) => datum[this._wordCloudShapeConfig.fillingColorHexField]
            : this.getWordColorAttribute(this._wordCloudShapeConfig.fillingSeriesField, true),
          text: (datum: Datum) => datum[textField],
          x: (datum: Datum) => datum.x,
          y: (datum: Datum) => datum.y,
          fontFamily: (datum: Datum) => datum.fontFamily,
          fontSize: (datum: Datum) => datum.fontSize,
          fontStyle: (datum: Datum) => datum.fontStyle,
          fontWeight: (datum: Datum) => datum.fontWeight,
          angle: (datum: Datum) => datum.angle,
          visible: (datum: Datum) => datum.isFillingWord
        },
        'normal',
        AttributeLevel.Series
      );

      this.setMarkStyle(
        fillingWordMark,
        {
          fontFamily: this._spec.word?.style?.fontFamily ?? this._option?.getTheme()?.fontFamily
        },
        'normal',
        AttributeLevel.User_Mark
      );
    }
    this._trigger.registerMark(wordMark);
    this._tooltipHelper?.activeTriggerSet.mark.add(wordMark);
    this._trigger.registerMark(fillingWordMark);
    this._tooltipHelper?.activeTriggerSet.mark.add(fillingWordMark);
  }

  initAnimation() {
    [this._wordMark, this._fillingWordMark].forEach(mark => {
      if (mark) {
        const appearPreset = (this._spec?.animationAppear as IStateAnimateSpec<any>)?.preset;
        const params = {
          animationConfig: () => mark.getAnimationConfig()?.appear?.[0]
        };
        mark.setAnimationConfig(
          animationConfig(
            DEFAULT_MARK_ANIMATION.wordCloud(params, appearPreset),
            userAnimationConfig(SeriesMarkNameEnum.word, this._spec)
          )
        );
      }
    });
  }

  protected getWordOrdinalColorScale(field: string, isFillingWord: boolean) {
    const colorList = isFillingWord ? this._wordCloudShapeConfig.fillingColorList : this._colorList;
    const colorDomain = field ? this.getViewData()?.latestData.map((datum: Datum) => datum[field]) : [];
    const colorRange =
      colorList ??
      this._option.globalScale.getScale('color')?.range() ??
      getDataScheme(this._option.getTheme().colorScheme, this.type as any);
    return new ColorOrdinalScale().domain(colorDomain).range?.(colorRange);
  }

  getWordColorAttribute(field: string, isFillingWord: boolean) {
    if (this._colorMode === 'ordinal') {
      return {
        scale: this.getWordOrdinalColorScale(field, isFillingWord),
        field: this._seriesField ?? DEFAULT_DATA_SERIES_FIELD
      };
    }
    // const valueScale = new LinearScale()
    //   .domain(extent(this.getViewData()?.latestData.map((datum: Datum) => datum[field])), true)
    //   .range([0, 1]);
    let colorList =
      (isFillingWord ? this._colorList : this._wordCloudShapeConfig.fillingColorList) ??
      this._option.globalScale.getScale('color').range();
    // 如果用户只输入了一个 color，无法构成 colorRange，则进行兜底
    if (colorList.length === 1) {
      colorList = [colorList[0], colorList[0]];
    }
    // 颜色插值 todo@chensiji
    // const interpolate = interpolateColors(colorList)
    // return (datum: Datum) => interpolate(valueScale.scale(datum[field]))
    return (datum: Datum) => colorList[0];
  }

  compile(): void {
    super.compile();
    const { width, height } = this._region.getLayoutRect();
    // 非正常尺寸下不进行布局
    if (!isValidNumber(width) || !isValidNumber(height) || !(height > 0 && width > 0)) {
      return;
    }

    const wordCloudTransforms: any[] = [];
    const valueField = this._valueField;
    const valueScale = new LinearScale();
    const fontWeightRange = this._fontWeightRange;
    const rotateAngles = this._rotateAngles;
    const fontWeightField = this._fontWeightField;
    const fillingRotateAngles = this._wordCloudShapeConfig.fillingRotateAngles;

    // fontWeight处理
    if (valueField) {
      const [minValue, maxValue] = extent(this.getViewData()?.latestData.map((datum: any) => +datum[valueField]));
      valueScale.domain([minValue, maxValue], true).range(fontWeightRange);
      wordCloudTransforms.push({
        type: 'map',
        as: WORD_CLOUD_WEIGHT,
        callback: (datum: any) => {
          if (minValue === maxValue) {
            return valueScale.scale(maxValue);
          }
          return valueScale.scale(datum[valueField]);
        }
      });
    }

    // rotateAngles处理
    wordCloudTransforms.push({
      type: 'map',
      as: WORD_CLOUD_ANGLE,
      callback: () => {
        return rotateAngles[Math.floor(Math.random() * rotateAngles.length)];
      }
    });
    wordCloudTransforms.push({
      type: 'map',
      as: WORD_CLOUD_FILLING_ANGLE,
      callback: () => {
        return fillingRotateAngles[Math.floor(Math.random() * fillingRotateAngles.length)];
      }
    });

    // text fromat method 处理
    if (this._spec.word?.formatMethod) {
      wordCloudTransforms.push({
        type: 'map',
        as: WORD_CLOUD_TEXT,
        callback: this._spec.word.formatMethod
      });
    }

    const textField = this._spec.word?.formatMethod ? WORD_CLOUD_TEXT : this._nameField;

    // 词云 transform
    if (!this._isWordCloudShape) {
      wordCloudTransforms.push({
        type: 'wordcloud',
        // TIP: 非浏览器环境下，使用 fast 布局，否则会出现兼容问题
        layoutType: !isTrueBrowser(this._option.mode) ? 'fast' : this._wordCloudConfig.layoutMode,
        size: [width, height],
        shape: this._maskShape,
        dataIndexKey: DEFAULT_DATA_KEY,
        text: { field: textField },
        fontSize: valueField ? { field: valueField } : this._fontSizeRange[0],
        fontSizeRange: this._fontSizeRange,
        padding: this._fontPadding,
        rotate: { field: WORD_CLOUD_ANGLE },
        fontFamily: this._fontFamilyField ?? this._spec.word?.style?.fontFamily ?? this._option?.getTheme()?.fontFamily,
        fontWeight: fontWeightField ? { field: fontWeightField } : valueField ? { field: WORD_CLOUD_WEIGHT } : null,
        fontStyle: this._fontStyleField ?? this._spec.word?.style?.fontStyle,

        randomVisible: this._random,
        clip: this._wordCloudConfig.drawOutOfBound === 'clip',
        shrink: this._wordCloudConfig.zoomToFit.shrink,
        enlarge: this._wordCloudConfig.zoomToFit.enlarge,
        minFontSize: this._wordCloudConfig.zoomToFit.fontSizeLimitMin,
        progressiveTime: this._wordCloudConfig.progressiveTime,
        progressiveStep: this._wordCloudConfig.progressiveStep
      });
      // 挂到mark的transform上
      (this._wordMark as ICompilableMark).getProduct().transform(wordCloudTransforms);
    }
    // 形状词云 transform
    else {
      wordCloudTransforms.push({
        type: 'wordcloudShape',
        // 形状词云中必须要传入dataIndexKey, 否则填充词无法绘制
        dataIndexKey: DEFAULT_DATA_KEY,

        size: [width, height],
        shape: this._maskShape,

        text: { field: this._spec.word?.formatMethod ? WORD_CLOUD_TEXT : this._nameField },
        fontSize: valueField ? { field: valueField } : this._fontSizeRange[0],
        fontSizeRange: this._fontSizeRange,
        padding: this._fontPadding,
        rotateList: rotateAngles,
        fontFamily: this._fontFamilyField ?? this._spec.word?.style?.fontFamily ?? this._option?.getTheme()?.fontFamily,
        fontWeight: fontWeightField ? { field: fontWeightField } : valueField ? { field: WORD_CLOUD_WEIGHT } : null,
        fontStyle: this._fontStyleField ?? this._spec.word?.style?.fontStyle,

        fillingFontFamily:
          this._wordCloudShapeConfig?.fillingFontFamilyField ??
          this._spec.word?.style?.fontFamily ??
          this._option?.getTheme()?.fontFamily,
        fillingPadding: this._fillingFontPadding,
        fillingFontStyle: this._wordCloudShapeConfig?.fillingFontStyleField ?? this._spec.word?.style?.fontStyle,
        fillingFontWeight: this._wordCloudShapeConfig?.fillingFontWeightField ?? this._spec.word?.style?.fontWeight, // 填充词fontWeight默认不跟随valueField
        fillingRotateList: fillingRotateAngles,

        fillingTimes: this._wordCloudShapeConfig?.fillingTimes,
        fillingXStep: this._wordCloudShapeConfig?.fillingXStep,
        fillingYStep: this._wordCloudShapeConfig?.fillingYStep,
        fillingXRatioStep: this._wordCloudShapeConfig?.fillingXRatioStep,
        fillingYRatioStep: this._wordCloudShapeConfig?.fillingYRatioStep,
        fillingInitialOpacity: this._wordCloudShapeConfig?.fillingInitialOpacity,
        fillingDeltaOpacity: this._wordCloudShapeConfig?.fillingDeltaOpacity,
        fillingInitialFontSize: this._wordCloudShapeConfig?.fillingInitialFontSize,
        fillingDeltaFontSize: this._wordCloudShapeConfig?.fillingDeltaFontSize,

        ratio: this._wordCloudShapeConfig?.ratio,
        fillingRatio: this._wordCloudShapeConfig?.fillingRatio,
        removeWhiteBorder: this._wordCloudShapeConfig?.removeWhiteBorder,
        textLayoutTimes: this._wordCloudShapeConfig?.textLayoutTimes,
        fontSizeShrinkFactor: this._wordCloudShapeConfig?.fontSizeShrinkFactor,
        stepFactor: this._wordCloudShapeConfig?.stepFactor,
        layoutMode: this._wordCloudShapeConfig?.layoutMode,
        importantWordCount: this._wordCloudShapeConfig?.importantWordCount,
        globalShinkLimit: this._wordCloudShapeConfig?.globalShinkLimit,
        fontSizeEnlargeFactor: this._wordCloudShapeConfig?.fontSizeEnlargeFactor,
        fillingDeltaFontSizeFactor: this._wordCloudShapeConfig?.fillingDeltaFontSizeFactor
      });
    }
    // 把transform挂载到data的product上
    this._data.getProduct().transform(wordCloudTransforms);
  }

  getStatisticFields() {
    const fields: { key: string; operations: Array<'max' | 'min' | 'values'> }[] = [];
    fields.push({ key: this._nameField, operations: ['values'] });
    fields.push({ key: this._valueField, operations: ['max', 'min'] });
    return fields;
  }
  dataToPosition(data: Datum): IPoint {
    return null;
  }
  dataToPositionX(data: any): number {
    return null;
  }
  dataToPositionY(data: any): number {
    return null;
  }
  dataToPositionZ(data: any): number {
    return null;
  }
  valueToPosition(value1: any, value2?: any): IPoint {
    return null;
  }
  setValueFieldToStackOffsetSilhouette(): void {
    // do nothing
  }

  getGroupFields(): string[] {
    // do nothing
    return [];
  }

  getStackGroupFields(): string[] {
    // do nothing
    return [];
  }

  getStackValueField(): string {
    // do nothing
    return '';
  }

  setValueFieldToStack(): void {
    // do nothing
  }

  setValueFieldToPercent(): void {
    //do nothing
  }

  onLayoutEnd(ctx: any): void {
    super.onLayoutEnd(ctx);
    this.compile();
  }

  getActiveMarks(): IMark[] {
    return [this._wordMark, this._fillingWordMark];
  }
}
