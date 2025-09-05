#  Medical Form Builder (CorePage)
Библиотека для динамического создания и управления медицинскими формами
### Основные задачи 
* Создание динамической формы в бразуере, *без необходимости поднимать сервер*
* Хранение данных формы в **localStorage**
* Копирование заполненной формы в буфер-обмена
* Навигация между формами
* «Quote of the Day» в UI (на главной странице)

### Содержание репозитория
| Файл                | Описание                                                                                                                                              | Краткое назначение                                                                      |
|---------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|
| `anesth_variables.js` | Класс **`AnesthVariables`** – статические массивы со справочными данными (группы крови, венозные/артериальные сосуды, типы анестезии, риски, имена медсестр). | Источник констант для выпадающих списков и прочих справочных полей в формах.            |
| `core_page.js`        | Класс **`Page`** – ядро генератора форм. Реализует паттерн *Factory* для создания `form`, `div`, `section`, `article`. Содержит методы `addHeader`, `addField`, `addDiv`, `addSeparator`, `addSpacer`, `copyFormText`, `saveToLocalStorage`, `loadFromLocalStorage`, `clearLocalStorage`, `setPageTitle`, `getFormData`, `renderNavList`, утилиты даты/времени и др. | Позволяет программно формировать любые формы, управлять их данными, экспортировать и копировать их содержимое. |
| `quoteOfTheDay.js`    | Массив `quotes` (текст + автор) и функции `getQuoteOfTheDay`, `displayQuoteOfTheDay`. При загрузке страницы выводит случайную цитату.                         | «Цитата дня», добавляющая элемент на страницу.                         |

### Пример использования класса *Page*

```javascript
// Инициализируем форму
const page = new Page('#app', {
  formClass: 'medical-form',
  initType: Page.ContainerType.FORM,
  version: { show: true, text: 'v2.2', position: 'footer' }
});

// Заголовок
page.addHeader('Медицинская карта пациента', 1);

// Выбор группы крови (используем справочник из AnesthVariables)
page.addField({
  type: 'select',
  name: 'blood_group',
  label: 'Группа крови:',
  options: AnesthVariables.patient.bloodGroup,
  value: AnesthVariables.patient.bloodGroup[0]   // по умолчанию «O (I)»
});

// Текстовое поле «ФИО пациента»
page.addField({
  type: 'text',
  name: 'patient_name',
  label: 'ФИО:',
  required: true
});

// Кнопка копировать
const copyBtn = document.createElement('button');
copyBtn.id = 'copyButton';
copyBtn.textContent = 'Скопировать текст';
document.body.appendChild(copyBtn);
page.initCopyFunct('copyButton');

```

### Пример использования вспомогательного класса *AnesthVariables*
```javascript
// Получение списка артерий
const arteries = AnesthVariables.art;   // массив строк
```

###  Статический метод для рендера навигационного списка используем с классом *NavVariables*
```javascript
NavVariables.ref.forEach(item => {
  // item.href, item.text
});
Page.renderNavList('#sidebar', NavVariables.ref);
```
### «Цитата дня» (quoteOfTheDay.js)
```javascript
window.onload = displayQuoteOfTheDay;   // выводит случайную цитату в элементы #quote-of-the-day / #quote-author

```

### CSS‑стили

| Файл                     | Описание                                                                                                                                                                                       |
|--------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `css/core_page_style.css`| **Формы и пользовательский интерфейс**: контейнеры форм, элементы ввода (`input`, `select`, `textarea`), кнопки, навигационное меню.  Содержит переменные цветов (`--primary-color`, `--secondary-color` и др.), адаптивную типографику, *Для компоновки элемнтов формы применена Flex*. Также применяются стили состояний (`hover`, `focus`, `invalid`).|


