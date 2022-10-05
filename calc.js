const PARAMETERS = {
    // количество подключений
    flatsCount: {
        start: 1000,
        step: 100,
        visibleValues: new Set([
            // в массиве нужно прописать только точки,
            // которые будут отображаться в калькуляторе
            // пропущенные будут заполнены и скрыты,
            // чтобы сохранить правильный масштаб ползунка
            100,
            200,
            300,
            500,
            1000,
            1500,
            2000
        ]),
    },
    // стоимость аренды
    price: {
        min: 1500,
        max: 10000,
        start: 2500, // начальное значение
    },
};

const textMessages = {
    title: "Рассчитайте ваш ежемесячный доход",
    resultLabel: "Ежемесячный доход",
    flatsCount: "Количество подключений",
    price: "Стоимость аренды 1 квартиры за 1 сутки",
    currencySign: "₽",
};

function formatValue(value) {
    return String(value).replace(/(\d)(?=(\d{3})+$)/g, '$1 ');
}

// функция getResult
// возвращает рассчитанный результат с форматированием
function calcResult(flatsValue, priceValue, currencySign = textMessages.currencySign) {
    const value = flatsValue * priceValue * 20 * 0.15;
    return `${formatValue(value)} ${currencySign}`
}

// функция getResultTemplate
// возвращает html для блока с результатом вычислений
function getResultTemplate() {
    return `
    <div class="calc__result">
        <h3 class="calc__result-label">${textMessages.resultLabel}</h3>
        <div class="calc__result-value">${calcResult(PARAMETERS.flatsCount.start, PARAMETERS.price.start)}</div>
    </div>`;
}

// функция getFlatsStepTemplate
// возвращает html для точек с количеством квартир
function getFlatsStepTemplate(value) {
    const isVisible = PARAMETERS.flatsCount.visibleValues.has(value);
    const isActive = value === PARAMETERS.flatsCount.start;

    const hideClass = isVisible ? '' : 'calc-range__li--hide';
    const activeClass = isActive ? 'calc-range__li--active' : '';

    const classValue = `calc-range__li ${hideClass} ${activeClass}`;

    return `<li class="${classValue}" data-value="${value}">${value}</li>`
}

// функция getFlatsStepTemplate
// возвращает html для точек с количеством квартир
function getFlatsListCountTemplate() {
    let result = '';
    const visibleValuesArr = Array.from(PARAMETERS.flatsCount.visibleValues);
    const min = visibleValuesArr[0];
    const max = visibleValuesArr[visibleValuesArr.length - 1];

    for (let value = min; value <= max; value += PARAMETERS.flatsCount.step) {
        result += getFlatsStepTemplate(value)
    }
    return result;
}


// функция getFlatsTemplate
// возвращает html для блока со списком точек
function getFlatsTemplate() {
    return `<div class="calc__range calc__range--flats calc-range">
                <h3 class="calc-range__label">${textMessages.flatsCount}</h3>
                <ul class="calc-range__list">
                    ${getFlatsListCountTemplate()}
                </ul>
                <div class="calc-range__indicator"></div>
            </div>`;
}

// функция getPriceTemplate
// возвращает html для блока с ценой квартиры за сутки
function getPriceTemplate(currentValue) {
    const min = PARAMETERS.price.min;
    const max = PARAMETERS.price.max;
    return `<div class="calc__range calc__range--flow calc__range--cost calc-range">                               
                <h3 class="calc-range__label">
                    ${textMessages.price} <span style="float: right; color: #ccc;">Ср. 2&nbsp;500&nbsp;&#8381;</span>
                </h3>
                <ul class="calc-range__list">
                  <li class="calc-range__li" data-value="${min}">${formatValue(min)} ₽</li>
                  <li class="calc-range__li" data-value="${max}">${formatValue(max)} ₽</li>
                </ul>
                <div class="calc-range__indicator" data-content="${currentValue} ₽"></div>
            </div>`;
}


// функция createElement
// преобразует шаблон в html element и возвращает его
function createElement(template) {
    const div = document.createElement('div');
    div.insertAdjacentHTML("beforeend", template);
    return div.children[0];
}

class Calc {
    constructor() {
        this.values = {
            currentPrice: PARAMETERS.price.start,
            currentFlatsCount: PARAMETERS.flatsCount.start,
        };

        const container = document.querySelector('.as-partner-calc');
        const calcElement = createElement(this.getTemplate());
        container.append(calcElement);

        const flatsRangeElement = calcElement.querySelector('.calc__range--flats');
        const priceRangeElement = calcElement.querySelector('.calc__range--cost');

        this.elements = {
            calc: calcElement,
            result: calcElement.querySelector('.calc__result-value'),
            flatsRangeElement,
            priceRangeElement,
            flatsPoints: flatsRangeElement.querySelectorAll('.calc-range__li:not(.calc-range__li--hide)'),
            flatsControl: flatsRangeElement.querySelector('.calc-range__indicator'),
            currentFlatPoint: flatsRangeElement.querySelector('.calc-range__li--active'),
            priceControl: priceRangeElement.querySelector('.calc-range__indicator'),
        };

    }
    init () {
        const calcElement = document.querySelector('.as-partner-calc .calc');
        if (!calcElement) {
            return;
        }
        this.setControlsPosition();
        this.setIndicator(this.elements.flatsControl);
        this.setFlowIndicator(this.elements.priceControl);

        this.setFlatCount();
        const calc = this;
        const width = window.innerWidth;
        let idTimeout = 0;
        window.addEventListener('resize', () => {
            if (width !== window.innerWidth) {
                clearTimeout(idTimeout);
                idTimeout = setTimeout(()=> {
                    calc.setControlsPosition();
                }, 300);
            }
        });
    }

    resize() {
        this.setControlsPosition();
    }

    setControlsPosition() {
        this.flatsAblePositions = this.findFlatPositions(this.elements.flatsPoints);
        calc.elements.flatsControl.style.left = calc.elements.currentFlatPoint.offsetLeft + 1 + 'px';

        const firstElement = calc.elements.priceRangeElement.querySelector('.calc-range__li:first-child');
        const leftEdge = firstElement.offsetLeft + firstElement.offsetWidth / 2 - 8;
        const lastElement = calc.elements.priceRangeElement.querySelector('.calc-range__li:last-child');
        const rightEdge = lastElement.offsetLeft + lastElement.offsetWidth / 2;
        const widthRange = rightEdge - leftEdge;
        calc.elements.priceControl.style.left = Math.round(widthRange * ((this.values.currentPrice - PARAMETERS.price.min) / (PARAMETERS.price.max - PARAMETERS.price.min))) + 'px';

    }

    // функция getTemplate
    // возвращает html шаблон для калькулятора
    getTemplate() {
        const currentValue = this.values.currentPrice;
        return `<section class="calc">
                <h2 class="calc__title">${textMessages.title}</h2>
                <div class="calc__color-field">
                    ${getResultTemplate()}
                    ${getFlatsTemplate()}
                    ${getPriceTemplate(currentValue)}
                </div>    
            </section>`;
    }

    findFlatPositions(elements) {
        const ulRect = elements[0].closest('ul').getBoundingClientRect();
        return Array.from(elements).map(li => {
            const value = li.getAttribute('data-value');
            const liRect = li.getBoundingClientRect();

            const position = {
                x: liRect.x - ulRect.x,
                y: liRect.y - ulRect.y,
            };
            return {
                value: value,
                position: position,
                element: li,
            }
        });
    }

    setFlatCount() {
        const calc = this;
        // для всех доступных вариантов добавить обработчик клика
        for (let item of this.flatsAblePositions) {
            item.element.addEventListener('click', function (evt) {
                evt.preventDefault();
                // активный элемент сделать простым
                calc.elements.currentFlatPoint.classList.remove('calc-range__li--active');
                // выбранный элемент сделать активным
                item.element.classList.add('calc-range__li--active');
                // изменить текущее значение
                calc.values.currentFlatsCount = item.value;
                // переместить отметку к выбранному элементу
                calc.elements.flatsControl.style.left = item.position.x + 'px';
                calc.setSummary();
            });
        }
    }
    setSummary() {
        this.elements.result.innerText = calcResult(this.values.currentFlatsCount, this.values.currentPrice);
    }

    setIndicator(indicatorElement) {
        const calc = this;
        let minItem;
        indicatorElement.addEventListener('mousedown', onDown);
        indicatorElement.addEventListener('touchstart', onDown);

        function onDown(evt) {

            evt.preventDefault();
            let startX;
            if (evt.type === 'mousedown') {
                startX = evt.clientX;
            } else {
                startX = evt.touches[0].clientX;
            }

            const startOffsetLeft = indicatorElement.offsetLeft;

            const onMove = function (moveEvt) {
                let shiftX;
                if (moveEvt.type === 'mousemove') {
                    // moveEvt.preventDefault();
                    shiftX = startX - moveEvt.clientX;
                } else {
                    shiftX = startX - moveEvt.touches[0].clientX;
                }

                indicatorElement.classList.add('calc-range__indicator--active');

                let newIndicatorLeft = startOffsetLeft - shiftX - indicatorElement.offsetWidth / 2;

                let widthList = indicatorElement.previousElementSibling.offsetWidth;
                if (newIndicatorLeft < 0) {
                    newIndicatorLeft = 0;
                } else if (newIndicatorLeft > widthList) {
                    newIndicatorLeft = widthList - indicatorElement.offsetWidth / 2;
                }

                indicatorElement.style.left = newIndicatorLeft + 'px';
                minItem = calc.getClosestPoint(indicatorElement, newIndicatorLeft);
            }
            const onUp = function (upEvt) {
                if (upEvt.type === 'mouseup') {
                    upEvt.preventDefault();
                }
                indicatorElement.classList.remove('calc-range__indicator--active');
                indicatorElement.style.left = minItem.position.x + 'px';
                calc.values.currentFlatsCount = minItem.value;
                calc.elements.currentFlatPoint.classList.remove('calc-range__li--active');
                minItem.element.classList.add('calc-range__li--active');
                calc.elements.currentFlatPoint = minItem.element;
                calc.setSummary();
                document.removeEventListener("mousemove", onMove);
                document.removeEventListener("touchmove", onMove);
                document.removeEventListener("touchend", onUp);
                document.removeEventListener("mouseup", onUp);
            }
            document.addEventListener('mousemove', onMove);
            document.addEventListener("touchmove", onMove);
            document.addEventListener("touchend", onUp);
            document.addEventListener('mouseup', onUp);
        }
    }

    setFlowIndicator(indicatorElement) {
        const calc = this;
        indicatorElement.addEventListener('mousedown', onDown);
        indicatorElement.addEventListener('touchstart', onDown);

        function onDown(evt) {
            evt.preventDefault();
            let startX;
            if (evt.type === 'mousedown') {
                startX = evt.clientX;
            } else {
                startX = evt.touches[0].clientX;
            }

            const startOffsetLeft = indicatorElement.offsetLeft;

            const onMouseMove = function (moveEvt) {
                moveEvt.preventDefault();
                indicatorElement.classList.add('calc-range__indicator--active');
                let shiftX;
                if (moveEvt.type === 'mousemove') {
                    shiftX = startX - moveEvt.clientX;
                } else {
                    shiftX = startX - moveEvt.touches[0].clientX;
                }
                let newIndicatorLeft = startOffsetLeft - shiftX - indicatorElement.offsetWidth / 2;

                const firstElement = calc.elements.priceRangeElement.querySelector('.calc-range__li:first-child');
                const leftEdge = firstElement.offsetLeft + firstElement.offsetWidth / 2 - 8;
                const lastElement = calc.elements.priceRangeElement.querySelector('.calc-range__li:last-child');
                const rightEdge = lastElement.offsetLeft + lastElement.offsetWidth / 2 - 12;
                const widthRange = rightEdge - leftEdge;

                let currentValue = Math.round(newIndicatorLeft * ((PARAMETERS.price.max - PARAMETERS.price.min) / widthRange)) + PARAMETERS.price.min;

                if (newIndicatorLeft < leftEdge) {
                    newIndicatorLeft = leftEdge;
                    currentValue = PARAMETERS.price.min;
                } else if (newIndicatorLeft > rightEdge) {
                    newIndicatorLeft = rightEdge + 12 - indicatorElement.offsetWidth / 2;
                    currentValue = PARAMETERS.price.max;
                }

                indicatorElement.style.left = newIndicatorLeft + 'px';

                calc.values.currentPrice = currentValue;
                indicatorElement.setAttribute('data-content', `${String(calc.values.currentPrice).replace(/(\d)(?=(\d{3})+$)/g, '$1 ')} ₽`);

                calc.setSummary();
            }
            const onMouseUp = function (upEvt) {
                upEvt.preventDefault();
                indicatorElement.classList.remove('calc-range__indicator--active');
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
                document.removeEventListener("touchmove", onMouseMove);
                document.removeEventListener("touchend", onMouseUp);
            }
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            document.addEventListener('touchmove', onMouseMove);
            document.addEventListener('touchend', onMouseUp);
        }
    }

    getClosestPoint(indicatorElement, left) {
        const arrayValue = this.flatsAblePositions;
        const sortArray = arrayValue
            .map(item => {
                return {
                    value: item.value,
                    path: Math.abs(item.position.x - left),
                    position: item.position,
                    element: item.element,
                };
            })
            .sort((a, b) => {
                if (a.path > b.path) return 1;
                if (a.path === b.path) return 0;
                if (a.path < b.path) return -1;
            });

        return sortArray[0]; // min
    }
}

const calc = new Calc();
calc.init();
