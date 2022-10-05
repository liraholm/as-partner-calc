## Установка
Добавить в html `div` c классом `as-partner-calc`

```html 
<div class="as-partner-calc"></div>
```

Перед `</body>` подключить файл `calc.js`:
```html
<body>
    ...
    <div class="as-partner-calc"></div>
    ...
    <script src="calc.js"></script>
</body>
```

В `head` подключить стили `calc.css`
```html
<head>
    ...
    <link rel="stylesheet" href="calc.css">
    ...
</head>
```

## Настройка параметров калькулятора


В файле `calc.js`:
- объект `PARAMETERS` отвечает за технические настройки калькулятора.
- объект `textMessages` отвечает за подписи к полям и заголовки

Остальную часть без надобности лучше не трогать

## Стили

Шрифт для заголовка наследуется.

Стили цветного фона можно поменять в классе `.calc__color-field`.

Шрифт для калькулятора можно задать в классе `.calc`. 
Важно проверить наличие знака ₽ в шрифте
