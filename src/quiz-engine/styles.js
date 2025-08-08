// src/quiz-engine/styles.js
import { config as engineConfig } from './config.js';

export function applyMessageStyles(container) {
    container.style.display = engineConfig.styles.messageDisplay;
    container.style.alignItems = engineConfig.styles.messageAlignItems;
    container.style.marginTop = engineConfig.styles.messageMarginTop;
}

export function applyResultStyles(element, isCorrect) {
    element.style.color = isCorrect ? engineConfig.styles.correctColor : engineConfig.styles.incorrectColor;
    element.style.margin = engineConfig.styles.resultMargin;
}

export function applyTryAgainButtonStyles(button) {
    button.style.marginLeft = engineConfig.styles.tryAgainMargin;
}

export function applyExplanationStyles(element, isCorrect) {
    element.style.marginTop = '5px';
    element.style.fontStyle = 'italic';
    element.style.color = isCorrect ? engineConfig.styles.correctColor : engineConfig.styles.incorrectColor;
}
