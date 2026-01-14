import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  Renderer2
} from '@angular/core';

@Directive({
  selector: '[appUnderlineMatch]'
})
export class UnderlineMatchDirective implements OnChanges {

  @Input() text!: string;
  @Input() matchedWord?: string;
  @Input() color?: string;

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

    // fallback
    if (!this.text || !this.matchedWord || !this.color || this.color === '#000000') {
      this.renderer.setProperty(host, 'textContent', this.text ?? '');
      return;
    }

    const trimmedMatch = this.removeLastWord(this.matchedWord);
    if (!trimmedMatch) {
      this.renderer.setProperty(host, 'textContent', this.text);
      return;
    }

    const index = this.text.indexOf(trimmedMatch);
    if (index === -1) {
      this.renderer.setProperty(host, 'textContent', this.text);
      return;
    }

    const before = this.text.slice(0, index);
    const match = this.text.slice(index, index + trimmedMatch.length);
    const after = this.text.slice(index + trimmedMatch.length);

    // before
    this.renderer.appendChild(host, this.renderer.createText(before));

    // span بدون class
    const span = this.renderer.createElement('span');

    this.renderer.setStyle(span, 'font-weight', '700');
    this.renderer.setStyle(span, 'text-decoration-line', 'underline');
    this.renderer.setStyle(span, 'text-decoration-color', this.color);
    this.renderer.setStyle(span, 'text-decoration-thickness', '2px');
    this.renderer.setStyle(span, 'text-underline-offset', '6px');

    this.renderer.appendChild(span, this.renderer.createText(match));
    this.renderer.appendChild(host, span);

    // after
    this.renderer.appendChild(host, this.renderer.createText(after));
  }

  private removeLastWord(text: string): string {
    const parts = text.trim().split(' ');
    parts.pop();
    return parts.join(' ');
  }
}
