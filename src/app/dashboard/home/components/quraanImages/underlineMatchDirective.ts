import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  Renderer2
} from '@angular/core';

export interface ColoredWord {
  word: string;
  color: string;
}

@Directive({
  selector: '[appUnderlineMatch]'
})
export class UnderlineMatchDirective implements OnChanges {

  @Input() text!: string;
  @Input() coloredWords?: ColoredWord[];

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {}

  ngOnChanges(): void {
    this.render();
  }

  private render(): void {
    const host = this.el.nativeElement;
    host.innerHTML = '';

    if (!this.text) {
      this.renderer.setProperty(host, 'textContent', this.text ?? '');
      return;
    }

    if (!this.coloredWords || this.coloredWords.length === 0) {
      this.renderer.setProperty(host, 'textContent', this.text);
      return;
    }

    const tashkeelWords = this.text.split(' ');

    // Group consecutive words that share the same color into one span
    // so the underline is continuous across spaces
    interface Group { color: string | null; words: string[] }
    const groups: Group[] = [];

    for (let i = 0; i < tashkeelWords.length; i++) {
      const coloredWord = this.coloredWords[i];
      const color = (coloredWord && coloredWord.color && coloredWord.color !== '#000000')
        ? coloredWord.color
        : null;

      const last = groups[groups.length - 1];
      if (last && last.color === color) {
        last.words.push(tashkeelWords[i]);
      } else {
        groups.push({ color, words: [tashkeelWords[i]] });
      }
    }

    groups.forEach((group, gi) => {
      // Space between groups is a plain text node — never underlined
      if (gi > 0) {
        this.renderer.appendChild(host, this.renderer.createText(' '));
      }

      const text = group.words.join(' ');

      if (group.color) {
        const span = this.renderer.createElement('span');
        this.renderer.setStyle(span, 'font-weight', '700');
        this.renderer.setStyle(span, 'text-decoration-line', 'underline');
        this.renderer.setStyle(span, 'text-decoration-color', group.color);
        this.renderer.setStyle(span, 'text-decoration-thickness', '2px');
        this.renderer.setStyle(span, 'text-underline-offset', '6px');
        this.renderer.appendChild(span, this.renderer.createText(text));
        this.renderer.appendChild(host, span);
      } else {
        this.renderer.appendChild(host, this.renderer.createText(text));
      }
    });
  }
}
