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
#### СТАТИЧЕСКИЕ СВОЙСТВА:

**ContainerType** - перечисление допустимых типов контейнеров:
```	
- FORM: 'form'
- DIV: 'div'
- SECTION: 'section'
- ARTICLE: 'article'
```
#### КОНСТРУКТОР:
 ```javascript
    new Page(containerSelector = '.form-container', config = {})
 ```
---

#### ОСНОВНЫЕ МЕТОДЫ:

 ##### Установка заголовка страницы
`setPageTitle(title, includeVersion = true)`

    Параметры:
	
     * title: основной заголовок
     * includeVersion: показывать ли версию
	 
```javascript
   //Пример:
   page.setPageTitle('Заголовок страницы');
```
 ##### Добавление заголовка <h1> - <h6>
`addHeader(text, level = 2, container = null)`

    Параметры:

     * text: текст заголовка
     * level: уровень заголовка (1-6)
     * container: родительский элемент

   ***Возвращает: HTML-элемент заголовка (H1-H6)***


```javascript
// Пример
   page.addHeader('Заголовок второго уровня', 2);
```


 ##### Добавление поля ввода в форму
 `addField(params)`

 Параметры:

 ```javascript
     {
       type: 'text',             // Тип поля (text/select/textarea/checkbox/radio)
       name: 'fieldname',        // Имя поля (обязательное)
       label: 'Field Label',     // Текст подписи
       value: '',                // Значение по умолчанию
       options: [],              // Опции для select
       subText: '',              // Дополнительный текст (например единцы измерения)
       required: true,           // Обязательное поле
       container: null,          // Родительский элемент
       className: ''             // Дополнительные CSS-классы (например для стилизации)
     }
```
   ***Возвращает: HTML-элемент поля***

```javascript
 // Текстовое поле
   page.addField({
     type: 'text',
     name: 'username',
     label: 'Имя пользователя:'
  });

   // Выпадающий список
   page.addField({
     type: 'select',
     name: 'gender',
     label: 'Пол:',
     options: ['Мужской', 'Женский']
   });
```

 ##### Добавление DIV-контейнера
 `addDiv(name, parent = this.form, options = {})`
   
  Параметры:

     * name: CSS-класс контейнера
     * parent: родительский элемент
     * options: дополнительные параметры:
       {
         id: 'elementId',       // ID элемента
         attrs: {}              // Дополнительные атрибуты
       }
	   
  ***Возвращает: HTML-элемент DIV***
  
```javascript
	//Пример:
   const section = page.addDiv('user-section', null, {
     id: 'user-info',
     attrs: { 'data-type': 'info' }
   });   
```

##### Возвращение данных формы в виде объекта
   `getFormData()`
   ***Возвращает: { имя_поля: значение }***
```javascript
   //Пример:
   const formData = page.getFormData();
   console.log(formData.username);
```

##### Копирование текста в буфер-обмена

*Метод привязывает обработчик события click к кнопке, которая должна инициировать копирование текста*
```javascript
	// Инициализация копирования    
    page.initCopyFunct();
```		
	id кнопки должно быть ***id="copyButton"***
```html
	<button id="copyButton">Скопировать текст</button>
	<input id="source" type="text" value="Текст для копирования">
```
##### Сохранение в LocalStorage
*Метод привязывает обработчик события click к кнопке, которая должна инициировать сохранение в LocalStorage*
```javascript
	// Инициализация сохранения   
	page.initSaveFunct();
```	
	id кнопки должно быть ***id="saveButton"***
```html
	<button id="saveButton">Скопировать в LocalStorage</button>
	<input id="source" type="text" value="Текст для сохранения">
```

---
##### ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ:

	- `getCurrentDate()` -  cтатический метод для получения текущей даты
	- `setCurrentTimeRounded(isRound)` - статический метод получения и (опционального) округления текущего времени (до десятков минут)
	- `addSeparator()` - добавляет горизонтальный разделитель (<hr>)
	- `addSpacer()` - добавляет разделительную линию (120 символов '-')
	- `removeField(name)` - удаляет поле по имени
	- `clearForm()` - полностью очищает форму
	- `showVersion(config)` - отображает версию интерфейса
	- `calculateBSA()` – публичный метод класса `Page`, реализует:
>
>- Валидацию входных данных (рост и масса) из полей с классами `mass-field` и `growth-field`.
>- Преобразование строковых значений в числа.
>- Вычисление ППТ по формуле Дюбуа:  
> `BSA = 0.007184 × рост^0.725 × масса^0.425`
>
>где:  
>- **рост** – рост в сантиметрах (см)  
>- **масса** – масса в килограммах (кг)  
>
>- Сохранение округлённого результата в объекте `formData`.
>- Обновление UI-элемента, в котором выводится результат (`class="bsa-field"`).
>- Вывод диагностических сообщений в консоль.
> ```javascript
>	// Вызываем метод рассчета и обновления ППТ
> page.calculateBSA();
>```


### Сериализация формы
 - преобразует данные HTML-формы в форматированный текст с последующим копированием в буфер обмена.
 
 Основные этапы:
1. Инициализация - подключение обработчика к кнопке `copyButton`
2. Сбор данных - извлечение и предварительное форматирование текста
3. Финальное форматирование - обработка структуры текста
4. Копирование - запись в буфер обмена и уведомление пользователя
  
1. Инициализация
```javascript
  // На странице должна быть кнопка с id="copyButton"
	const button = document.getElementById('copyButton');
	button.addEventListener('click', () => this.copyFormText());	
```
2. Метод `copyFormText()`
	Асинхронно выполняет всю последовательность операций:	
```javascript
  async copyFormText() {
  try {
    const rawText = this.getFormText();      // Сбор данных
    const formattedText = this.formatText(rawText);  // Форматирование
    await this.copyToClipboard(formattedText);      // Копирование
    this.showCopySuccess();                  // Уведомление
  } catch (error) {
    this.showCopyError(error);               // Обработка ошибок
  }
}	
```
3. Сбор данных `getFormText()`
Метод сканирует DOM и обрабатывает элементы по типам:


| Тип элемента|	CSS-класс   |	Форматирование            |
|---------------------------------------------------------
| Разделитель | .separator	| \n + 120 дефисов + \n       |
|Линейный разделитель	 |.line-spacer	| 120 дефисов + \n |
|Заголовок	|.form-header |	Текст + :\n |
| Произвольный элемент	|proc- |	textContent + \n |
| Группа полей |	.field-group |	Комплексная обработка| 
	
Обработка групп полей:

 - Извлекает `label, input/select/textarea` и `.sub-text`
 - Для select использует текст выбранной опции
 - Формирует строку: `метка: значение [доп.текст]`
 - Добавляет точку в конец 
 
4. Финальное форматирование `formatText()`

Обрабатывает "сырой" текст, применяя специальные правила для секций между разделителями:
```javascript
formatText(text) {
  const lines = text.split('\n');
  let result = '';
  let separatorCount = 0;
  let inTargetSection = false;  // Флаг целевой секции
  let currentGroup = [];        // Накопитель для строк секции

  // Обработка каждой строки
  for (let line of lines) {
    if (line.includes('#')) {
      // Обработка заголовков
    } else if (line.startsWith('----')) {
      // Обработка разделителей
      separatorCount++;
      inTargetSection = (separatorCount >= 2 && separatorCount < 3);
    } else if (inTargetSection) {
      // Накопление строк целевой секции
      currentGroup.push(line);
    } else {
      // Обычная обработка
      result += line + '\n';
    }
  }
  
  // Особое форматирование для целевой секции
  if (currentGroup.length > 0) {
    result += this.formatLineGroup(currentGroup.join('\n'));
  }
  
  return result;
}
```

Особенности целевой секции (*между вторым и третьим разделителями):
 - Строки объединяются попарно через пробел
 - Сохраняется пунктуация в конце каждой строки
			
### Пример страницы с использованием Medical Form Builder (CorePage)
```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" type="text/css" href="css/core_page_style.css">
  <script src="js/core_page.js"></script>
  <script src="js/anesth_variables.js"></script>
  <title>Заголовок</title>
</head>
<body>
  <!-- Создаем контейнер для формы-->
  <div class="form-container"></div>
  <!-- Контейнер для кнопок и кнопки-->
  <div class="pageButtons">
    <!-- Кнопка копирования -->
    <button type="button" name="copyButton" id="copyButton">Copy now!</button>
    <!-- Кнопка сохранения в localStorage -->
    <button type="button" name="saveButton" id="saveButton">Save</button>
    <!-- Кнопка очистки localStorage -->
    <button type="button" name="clearButton" id="clearButton">Clear</button>
  </div>

  <script>
    // Инициализируем форму
    const page = new Page('.form-container', {
      formClass: 'medical-form',
      initType: Page.ContainerType.FORM,
    });

    // Устанавливаем Tilte страницы
    page.setPageTitle('Медицинская карта пациента');

    // Заголовок <h1>
    page.addHeader('Медицинская карта пациента', 1);

    // Дата
    page.addField({
      type: 'text',
      name: 'date',
      label: 'Дата:',
      value: Page.getCurrentDate(),
      className: 'date-field',
    });

    // Время
    page.addField({
      type: 'text',
      name: 'time',
      label: 'Время:',
      //value: '09:00',
      value: Page.setCurrentTimeRounded(false),
      //setCurrentTimeRounded(true) - получает округленное время, setCurrentTimeRounded(false) - не округленнное
      className: 'time-field',

    });


    // Выбор группы крови (используем класс из AnesthVariables)
    page.addField({
      type: 'select',
      name: 'blood_group',
      label: 'Группа крови:',
      options: AnesthVariables.patient.bloodGroup,
      value: AnesthVariables.patient.bloodGroup[0]   // по умолчанию «O (I)»
    });

    // рост
    page.addField({
      type: 'text',
      name: 'growth',
      label: 'Рост:',
      value: '170',
      subText: 'cm',
      className: 'growth-field',
    });

    //масса
    page.addField({
      type: 'text',
      name: 'mass',
      label: 'Масса:',
      value: '70',
      subText: 'kg',
      className: 'mass-field',
    });

    //ППТ
    page.addField({
      type: 'text',
      name: 'bsaResult',
      label: 'ППТ:',
      value: '',
      subText: 'м²',
      className: 'bsa-field',
      readonly: true,
    });

    page.addSeparator(); // 1 разделитель
    page.calculateBSA(); //вызываем рассчет ППТ и обновление bsa-field

    // Текстовое поле «ФИО пациента»
    page.addField({
      type: 'text',
      name: 'patient_name',
      label: 'ФИО:',
      required: true
    });
    page.addSeparator(); // 2 разделитель
    <!-- ЦЕЛЕВАЯ СЕКЦИЯ -->
    // Состояние
    page.addField({
      type: 'select',
      name: 'patient-condition',
      label: 'Состояние:',
      value: "",
      options: AnesthVariables.patient.stateTypes,
      className: 'section-medical-examination-container'
    });

    // Сознание DATALIST
    page.addField({
      type: 'datalist',
      name: 'patient-level-of-consciousness',
      label: 'Уровень сознания:',
      placeholder: 'ясное',
      value: "ясное",
      options: AnesthVariables.patient.stateCons,
      className: 'section-medical-examination-container'
    });

    // Неврологический статус 
    page.addField({
      type: 'textarea',
      name: 'patient-status-neuro',
      label: 'Неврологический статус:',
      value: "без признаков острой неврологической симптоматики",
      className: 'section-medical-examination-container'
    });

    page.addSeparator(); // 3 разделитель

    //Врач
    page.addField({
      type: 'datalist',
      name: 'doctor',
      label: 'Врач:',
      options: AnesthVariables.docs,
      className: 'doctor'
    });

    // Медсестра
    page.addField({
      type: 'datalist',
      name: 'nurses',
      label: 'Медсестра:',
      options: AnesthVariables.nurses,
      className: 'nurses'
    });
    // Инициализация копирования    
    page.initCopyFunct();

    // Инициализация сохранения   
    page.initSaveFunct();

    // Инициализация  очистки формы   
    page.initClearFunct();

    // загрузка из хранилища
    page.loadFromLocalStorage();
  </script>
</body>
</html>
```
### Пример формируемого форматированного текста
```Дата: 05.09.2025.
Время: 17:13.
Группа крови: O (I).
Рост: 170 cm.
Масса: 70 kg.
ППТ: 1.81 м².
------------------------------------------------------------------------------------------------------------------------

ФИО: Иванов Иван Иванович.
------------------------------------------------------------------------------------------------------------------------

Состояние: удовлетворительное. Уровень сознания: ясное.
Неврологический статус: без признаков острой неврологической симптоматики. 

------------------------------------------------------------------------------------------------------------------------

Врач: Иванов И.И.
Медсестра: Иванова И.И.
```
***Между вторым и третьим разделителями можем наблюдать применямеое форматирование***

### Пример использования вспомогательного класса *AnesthVariables*
```javascript
// Получение списка артерий
const arteries = AnesthVariables.art;   // массив строк
```

###  Статический метод для рендера навигационного списка используем с классом *NavVariables*
```javascript
NavVariables.ref.forEach(item = {
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


