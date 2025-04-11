import {ButtonInnerElement, ButtonStateStyles} from '../../../../types/buttonInternal';
import {ButtonPosition as ButtonPositionT} from '../../../../types/button';
import {SVGIconUtils} from '../../../../utils/svg/svgIconUtils';
import {ButtonInnerElements} from './buttonInnerElements';
import {StatefulStyles} from '../../../../types/styles';
import {ButtonAccessibility} from './buttonAccessility';
import {ButtonStyles} from '../../../../types/button';
import {ButtonCSS} from './buttonCSS';

interface MouseState {
  state: keyof StatefulStyles;
}

type Styles = {[key: string]: ButtonStyles};

export class InputButton<T extends Styles = Styles> {
  elementRef: HTMLElement;
  protected readonly _mouseState: MouseState = {state: 'default'};
  readonly svg: SVGGraphicsElement;
  readonly customStyles?: T;
  readonly position?: ButtonPositionT;
  readonly dropupText?: string;

  constructor(buttonElement: HTMLElement, svg: string, position?: ButtonPositionT, customStyles?: T, dropupText?: string) {
    ButtonAccessibility.addAttributes(buttonElement);
    this.elementRef = buttonElement;
    this.svg = SVGIconUtils.createSVGElement(svg);
    this.customStyles = customStyles;
    this.position = position;
    this.dropupText = dropupText;
  }

  private buttonMouseLeave(customStyles?: ButtonStyles) {
    this._mouseState.state = 'default';
    if (customStyles) {
      ButtonCSS.unsetAllCSS(this.elementRef, customStyles);
      ButtonCSS.setElementsCSS(this.elementRef, customStyles, 'default');
    }
  }

  private buttonMouseEnter(customStyles?: ButtonStyles) {
    this._mouseState.state = 'hover';
    if (customStyles) ButtonCSS.setElementsCSS(this.elementRef, customStyles, 'hover');
  }

  private buttonMouseUp(customStyles?: ButtonStyles) {
    if (customStyles) ButtonCSS.unsetActionCSS(this.elementRef, customStyles);
    this.buttonMouseEnter(customStyles);
  }

  private buttonMouseDown(customStyles?: ButtonStyles) {
    this._mouseState.state = 'click';
    if (customStyles) ButtonCSS.setElementsCSS(this.elementRef, customStyles, 'click');
  }

  // be careful not to use onclick as that is used for button functionality
  private setEvents(customStyles?: ButtonStyles) {
    this.elementRef.onmousedown = this.buttonMouseDown.bind(this, customStyles);
    this.elementRef.onmouseup = this.buttonMouseUp.bind(this, customStyles);
    this.elementRef.onmouseenter = this.buttonMouseEnter.bind(this, customStyles);
    this.elementRef.onmouseleave = this.buttonMouseLeave.bind(this, customStyles);
  }

  public unsetCustomStateStyles(unsetTypes: (keyof T)[]) {
    if (!this.customStyles) return;
    for (let i = 0; i < unsetTypes.length; i += 1) {
      const type = unsetTypes[i];
      const style = type && this.customStyles[type];
      if (style) ButtonCSS.unsetActionCSS(this.elementRef, style);
    }
  }

  public reapplyStateStyle(setType: keyof T, unsetTypes?: (keyof T)[]) {
    if (!this.customStyles) return;
    if (unsetTypes) this.unsetCustomStateStyles(unsetTypes);
    const setStyle = this.customStyles[setType];
    if (setStyle) ButtonCSS.setElementCssUpToState(this.elementRef, setStyle, this._mouseState.state);
    this.setEvents(setStyle);
  }

  protected changeElementsByState(newChildElements: ButtonInnerElement[]) {
    this.elementRef.replaceChildren(...newChildElements);
    ButtonInnerElements.reassignClassBasedOnChildren(this.elementRef, newChildElements);
  }

  protected buildDefaultIconElement(iconId: string) {
    this.svg.id = iconId;
    return [this.svg];
  }

  protected createInnerElements(iconId: string, state: keyof T, customStyles?: ButtonStateStyles<T>) {
    const elements = ButtonInnerElements.createCustomElements(state, this.svg, customStyles);
    if (elements && elements.length > 0) {
      if (this.position === 'dropup-menu') {
        // if original svg - add original id, if custom use the custom id
        elements[0].id = elements[0] === this.svg ? iconId : 'dropup-menu-item-icon-element-custom';
      }
      return elements;
    }
    return this.buildDefaultIconElement(iconId);
  }
}
