export class SpeedometerComponent {
    private readonly container: HTMLElement;

    private readonly arrow: HTMLElement;

    private readonly reverse: HTMLElement;

    private readonly break: HTMLElement;

    protected readonly number: HTMLElement;

    protected readonly ticks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240];

    constructor() {
        this.container = document.createElement('div');
        this.arrow = document.createElement('div');
        this.reverse = document.createElement('div');
        this.break = document.createElement('div');
        this.number = document.createElement('div');

        this.container.classList.add('speedometer');
        this.arrow.classList.add('arrow');
        this.number.classList.add('number');
        this.reverse.classList.add('reverse');
        this.reverse.innerText = 'R';
        this.break.classList.add('break');
        this.break.innerText = '(P)';


        const ticks = document.createElement('div');
        ticks.classList.add('ticks');

        this.ticks.forEach((t: number) => {
            const tick = document.createElement('div');

            tick.classList.add('tick');
            tick.setAttribute('value', `${t}`);

            ticks.appendChild(tick);
        });

        this.container.appendChild(ticks);
        this.container.appendChild(this.number);
        this.container.appendChild(this.arrow);
        this.container.appendChild(this.reverse);
        this.container.appendChild(this.break);

        document.body.appendChild(this.container);
    }

    public update(speed: number, actions: Record<string, boolean>): void {
        const s = Number(Math.abs(speed).toFixed(1));

        this.arrow.style.transform = `rotate(${s !== 0 ? s - 125 : -130}deg)`;
        this.reverse.style.display = speed < -1 && actions.braking ? 'block' : 'none';
        this.break.style.display = actions.break ? 'block' : 'none';
        this.number.innerText = `${s} km / h`;
    }
}
