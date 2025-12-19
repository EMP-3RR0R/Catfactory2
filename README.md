# Креативная киска — конструктор котика

Кратко: пошаговый конструктор котика с SVG-превью, ценами и корзиной.

**Быстрый старт**
- Откройте `index.html`.
- Нажмите «Начать сборку», пройдите шаги.
- На последнем шаге — «Сохранить в корзину».
- Откройте `basket.html`, там отобразятся сохранённые котики.

**Формат хранения котика**
- Хранится в `localStorage` под ключом `cartItems` (JSON-массив).
- Элемент массива:
- `id`: число (timestamp)
- `selects`: объект настроек → `{ value, label }`
- `colors`: объект `id → hex` (например, `fur-color: "#f5cba7"`)
- `basePrice`: число
- `breakdown`: массив `{ label, amount }`
- `total`: число
- `svg`: строка с HTML SVG для превью

Пример:

```
{
	"id": 1734123456789,
	"selects": {
		"ears": { "value": "tufted", "label": "Обычные с кисточками" },
		"eyes": { "value": "round", "label": "Круглые" },
		"nose": { "value": "triangle", "label": "Треугольник" },
		"mouth": { "value": "smile", "label": "Улыбка" },
		"tail": { "value": "long", "label": "Длинный" },
		"tailPattern": { "value": "striped", "label": "Полосатый" }
	},
	"colors": {
		"fur-color": "#f5cba7",
		"ears-color": "#d98880",
		"tail-color": "#a04000",
		"stripes-color": "#000000",
		"belly-color": "#ffffff",
		"paws-color": "#f5cba7",
		"tapochki-color": "#ffffff",
		"nose-color": "#d98880"
	},
	"basePrice": 8000,
	"breakdown": [ { "label": "Хитрые глаза (eyes)", "amount": 450 } ],
	"total": 8450,
	"svg": "<svg ...>...</svg>"
}
```

**Важные моменты**
- Цены рандомизируются при загрузке и зависят от отличий от дефолта.
- «Выйти» доступна после шага 1 и предупреждает о несохранённых изменениях.
- Хвост рендерится позади тела (перемещён в начало DOM).
- Корзина рендерится динамически из `cartItems` и поддерживает удаление/очистку.

**Файлы**
- `index.html` — конструктор.
- `scripts/form-navigation.js` — шаги, применение опций/цветов, цены, сохранение.
- `basket.html` — корзина (динамическая).
- `scripts/basket.js` — рендер корзины из `localStorage`.
- `styles/*.css` — стили.