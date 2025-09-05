
/**
 * Класс Page - ядро для динамического создания форм на страницах
 * Реализует паттерн "Фабрика" для создания элементов формы
 */
class Page {
  /**
   * Конструктор класса
   * @param {string} containerSelector - CSS-селектор контейнера для формы (по умолчанию '.form-container')
   * @param {Object} config - Конфигурация формы
   * @param {string} config.formClass - CSS-класс для формы (по умолчанию 'form-group')
   * @throws {Error} Если контейнер не найден в DOM
   */


  // Статическое перечисление допустимых типов контейнеров
  static ContainerType = {
    FORM: 'form',
    DIV: 'div',
    SECTION: 'section',
    ARTICLE: 'article'
  };
  // Статическое свойство с версией
  static VERSION = '2.2';

  constructor(containerSelector = '.form-container', config = {}) {
    // Проверка существования контейнера
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      throw new Error(`Контейнер "${containerSelector}" не найден в DOM`);
    }

    // Конфиг версии
    this.versionConfig = {
      show: true,
      text: `v${this.constructor.VERSION}`,
      position: 'footer',
      ...config.version
    };

    // Конфигурация с валидацией
    this.config = this.validateConfig({
      formClass: 'form-group',
      initType: Page.ContainerType.FORM, // Значение по умолчанию FORM
      ...config
    });

    // Автоматическое отображение версии
    if (config.version?.show !== false) {
      this.showVersion({
        text: config.version?.text || `core page v${this.constructor.VERSION}`,
        position: config.version?.position || 'footer',
        className: config.version?.className || ''
      });
    }
    // Инициализация хранилища данных
    this.formData = {};

    // Создание базовой структуры 
    this.form = this.initContainer();
  }



showVersion(config = {}) {
    const versionElement = document.createElement('div');
    versionElement.className = `version-${config.position} ${config.className || ''}`;
    versionElement.textContent = config.text || `Версия ${this.constructor.VERSION}`;

    const target = config.position === 'sidebar'
      ? document.querySelector('.sidebar')
      : document.body;

    target.appendChild(versionElement);
  }

  getVersion() {
    return this.constructor.VERSION;
  }

  /**
 * Сохраняет текущие данные формы в localStorage
 * @param {string} storageKey - Ключ для сохранения данных (по умолчанию 'formData')
 */
  saveToLocalStorage(storageKey = 'formData') {
    try {
      localStorage.setItem(storageKey, JSON.stringify(this.formData));
      console.log('Данные формы сохранены в localStorage');
     // alert("Данные формы сохранены в localStorage");
    } catch (error) {
      console.error('Ошибка при сохранении в localStorage:', error);

    }
  }

 /**
 * Загружает данные из localStorage и обновляет formData
 * @param { string } storageKey - Ключ для загрузки данных(по умолчанию 'formData')
 */
loadFromLocalStorage(storageKey = 'formData') {
  try {
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      this.formData = JSON.parse(savedData);
      this.updateFormFields(); // Обновит поля формы (см. шаг 3)
      console.log('Данные формы загружены из localStorage');
      //alert("Данные формы загружены из localStorage");
      
    }
  } catch (error) {
    console.error('Ошибка при загрузке из localStorage:', error);
  }
}

  /**
   * Обновляет значения полей формы на основе данных из formData
   */
  updateFormFields() {
    Object.keys(this.formData).forEach(key => {
      const field = this.form.querySelector(`[name="${key}"]`);
      if (field) {
        if (field.type === 'checkbox' || field.type === 'radio') {
          field.checked = this.formData[key];
        } else {
          field.value = this.formData[key];
        }
      }
    });
  }


  /**
   * Очищает данные в localStorage
   * @param {string} storageKey - Ключ для очистки (по умолчанию 'formData')
   */
  clearLocalStorage(storageKey = 'formData') {
    localStorage.removeItem(storageKey);
    // Перезагрузит страницу, используя кэш браузера
    window.location.reload();

    // Перезагрузит страницу «жестко», сбросив кэш (аналог Ctrl+F5)
    //window.location.reload(true)
    console.log('Данные формы удалены из localStorage');
    alert("Данные формы удалены из localStorage");
  }

  /**
   * Устанавливает заголовок страницы с автоматическим добавлением версии
   * @param {string} title - Основной текст заголовка
   * @param {boolean} [includeVersion=true] - Добавлять ли версию в скобках
   * @returns {string} Полный установленный заголовок
   */
  setPageTitle(title, includeVersion = true) {
    let fullTitle = title;

    if (includeVersion) {
      fullTitle = `${title} (v${this.getVersion()})`;
    }

    document.title = fullTitle;

    // Дополнительно обновляем заголовок в интерфейсе, если есть соответствующий элемент
    const titleElement = document.querySelector('.page-title');
    if (titleElement) {
      titleElement.textContent = fullTitle;
    }

    return fullTitle;
  }

  /**
   * Валидирует конфигурацию
   * @private
   */
  validateConfig(config) {
    // Проверка типа контейнера
    if (!Object.values(Page.ContainerType).includes(config.initType)) {
      throw new Error(
        `Неподдерживаемый тип контейнера "${config.initType}". ` +
        `Допустимые значения: ${Object.values(Page.ContainerType).join(', ')}`
      );
    }

    // Проверка класса формы
    if (typeof config.formClass !== 'string' || !config.formClass.trim()) {
      throw new Error('Класс контейнера должен быть непустой строкой');
    }

    return config;
  }

  /**
   * Инициализирует основной контейнер
   * @returns {HTMLElement}
   * @private
   */
  initContainer() {
    // Поиск существующего контейнера
    const existingContainer = this.findExistingContainer();
    if (existingContainer) return existingContainer;

    // Создание нового через фабрику
    const newContainer = this.createContainerByType(this.config.initType);
    this.container.appendChild(newContainer);
    return newContainer;
  }

  /**
   * Фабрика контейнеров
   * @private
   */
  createContainerByType(type) {
    if (!this.containerFactories) {
      this.containerFactories = {
        [Page.ContainerType.FORM]: () => this.createFormElement(),
        [Page.ContainerType.DIV]: () => this.createDivElement(),
        [Page.ContainerType.SECTION]: () => this.createSectionElement(),
        [Page.ContainerType.ARTICLE]: () => this.createArticleElement()
      };
    }

    const factory = this.containerFactories[type];
    if (!factory) {
      throw new Error(`Unsupported container type: ${type}`);
    }

    return factory();
  }

  // Методы создания конкретных элементов
  createFormElement() {
    const form = document.createElement('form');
    form.className = this.config.formClass;
    return form;
  }

  createDivElement() {
    const div = document.createElement('div');
    div.className = this.config.formClass;
    return div;
  }

  createSectionElement() {
    const section = document.createElement('section');
    section.className = this.config.formClass;
    return section;
  }

  createArticleElement() {
    const article = document.createElement('article');
    article.className = this.config.formClass;
    return article;
  }

  /**
   * Поиск существующего контейнера
   * @private
   */
  findExistingContainer() {
    return this.container.querySelector(`.${this.config.formClass}`);
  }

  /**
 * Добавляет любой HTML-элемент в контейнер
 * @param {string} tagName - Название тега
 * @param {Object} options - Параметры элемента
 * @param {string} [options.className] - CSS-классы элемента
 * @param {string} [options.name] - Имя элемента (используется для auto-proc класса)
 * @param {string} [options.text] - Текст элемента
 * @param {HTMLElement} [options.parent] - Родительский элемент
 * @returns {HTMLElement} Созданный элемент
 */
/*
// Добавит класс "proc-username" автоматически
page.createElement('div', {
  name: 'username',
  text: 'Имя пользователя'
});

// Использует только указанный класс "custom-class"
page.createElement('span', {
  name: 'status',
  className: 'custom-class',
  text: 'Статус: активен'
});

// Добавит оба класса: "existing-class" и "proc-user-status"
page.createElement('div', {
  name: 'user-status',
  className: 'existing-class',
  text: 'Статус пользователя'
});
*/
  createElement(tagName, options = {}) {
    const element = document.createElement(tagName);
    const {
      name,
      text,
      parent = this.form, // По умолчанию - основная форма
      className,
      autoProc = true
    } = options;

    // 1. Обработка классов
    let finalClassName = className || '';

    if (autoProc && name) {
      const procClass = `proc-${name}`;
      if (!finalClassName.includes(procClass)) {
        finalClassName = finalClassName
          ? `${finalClassName} ${procClass}`
          : procClass;
      }
    }

    if (finalClassName) {
      element.className = finalClassName;
    }

    // 2. Добавление текста
    if (text) element.textContent = text;

    // 3. Поиск и добавление в родительский контейнер
    let targetParent;

    if (typeof parent === 'string') {
      // Если parent - строка, ищем по селектору
      targetParent = document.querySelector(parent) || this.form;
    } else if (parent instanceof HTMLElement) {
      // Если parent - DOM-элемент
      targetParent = parent;
    } else {
      // По умолчанию - основная форма
      targetParent = this.form;
    }

    targetParent.appendChild(element);

    return element;
  }
  /*
  * Добавляет DIV-контейнер в форму или указанный родительский элемент
  * @param {string} name - Имя класса для контейнера
  * @param {HTMLElement} [parent=this.form] - Родительский элемент (по умолчанию - форма)
  * @param {Object} [options] - Дополнительные параметры
  * @param {string} [options.id] - ID элемента
  * @param {Object} [options.attrs] - Дополнительные атрибуты (объект {attr: value})
  * @returns {HTMLDivElement} Созданный DIV-элемент
  */
  addDiv(name, parent = this.form, options = {}) {
    const div = document.createElement('div');
    div.className = name;

    // Установка ID если указан
    if (options.id) {
      div.id = options.id;
    }

    // Добавление дополнительных атрибутов
    if (options.attrs) {
      for (const [attr, value] of Object.entries(options.attrs)) {
        div.setAttribute(attr, value);
      }
    }

    parent.appendChild(div);
    return div;
  }


  /**
 * Добавляет заголовок в указанный контейнер или перед формой
 * @param {string} text - Текст заголовка
 * @param {number} [level=2] - Уровень заголовка (1-6)
 * @param {HTMLElement} [container] - Контейнер для вставки (если не указан - вставляется перед формой)
 * @returns {HTMLHeadingElement} Созданный заголовок
 * @throws {Error} Если уровень заголовка невалиден
 */
  addHeader(text, level = 2, container = null) {
    if (level < 1 || level > 6) {
      throw new Error('Уровень заголовка должен быть между 1 и 6');
    }

    const header = document.createElement(`h${level}`);
    header.textContent = text;
    header.className = `form-header form-header--${level}`;

    if (container) {
      container.appendChild(header);
    } else {
      this.container.insertBefore(header, this.form);
    }

    return header;
  }

  /**
  * Создает и добавляет поле ввода в форму или указанный контейнер
  * @param {Object} params - Параметры поля
  * @param {string} params.type - Тип поля ('text', 'select', 'textarea', 'checkbox', 'radio')
  * @param {string} params.name - Атрибут name поля (обязательный)
  * @param {string} [params.label] - Текст подписи к полю
  * @param {string|number} [params.value=''] - Начальное значение. Для select:
  *                                           - строка: ищет совпадение с value option
  *                                           - число: интерпретируется как индекс в options
  *                                           - если не указано: выбирается первый элемент
  * @param {Array<string|Object>} [params.options=[]] - Опции для select. Может быть:
  *                                                    - массив строк: ['Option1', 'Option2']
  *                                                    - массив объектов: [{value: 'val1', text: 'Text1'}, ...]
  * @param {string} [params.subText] - Дополнительный поясняющий текст под полем
  * @param {boolean} [params.required=true] - Обязательное ли поле
  * @param {HTMLElement} [params.container=this.form] - Контейнер для вставки элемента
  * @param {string} [params.className] - Дополнительные CSS-классы для контейнера поля
  * @returns {HTMLElement} Созданный элемент ввода
  * @throws {Error} Если не указан параметр name
  * 
  * @example // Простое текстовое поле
  * addField({
  *   type: 'text',
  *   name: 'username',
  *   label: 'Имя пользователя:'
  * });
  * 
  * @example // Select с автоматическим выбором первого элемента
  * addField({
  *   type: 'select',
  *   name: 'gender',
  *   label: 'Пол:',
  *   options: ['Мужской', 'Женский'] // Выберется "Мужской"
  * });
  * 
  * @example // Select с указанием значения
  * addField({
  *   type: 'select',
  *   name: 'blood_group',
  *   label: 'Группа крови:',
  *   value: 'A', // Выбор по значению
  *   options: [
  *     {value: 'O', text: 'O (I)'},
  *     {value: 'A', text: 'A (II)'}
  *   ]
  * });
  * 
  * @example // Select с указанием индекса
  * addField({
  *   type: 'select',
  *   name: 'rh_factor',
  *   label: 'Резус-фактор:',
  *   value: 1, // Выбор по индексу (второй элемент)
  *   options: ['+ (положительный)', '- (отрицательный)']
  * });
  * 
  * Еще примеры
  * // Вариант 1: Автоматический выбор первого элемента
consultationPage.addField({
  type: 'select',
  name: 'blood',
  label: 'Группа крови:',
  options: ["O (I)", "A (II)", "B (III)"], // Выберется "O (I)"
  container: flexRight
});

// Вариант 2: Явное указание значения
consultationPage.addField({
  type: 'select',
  name: 'blood',
  label: 'Группа крови:',
  value: "A (II)", // Явно указать нужное значение
  options: ["O (I)", "A (II)", "B (III)"],
  container: flexRight
});

// Вариант 3: Использование индекса
consultationPage.addField({
  type: 'select',
  name: 'blood',
  label: 'Группа крови:',
  value: 2, // Выберется "B (III)" (индексация с 0)
  options: ["O (I)", "A (II)", "B (III)"],
  container: flexRight
});
  */
  addField(params) {
    if (!params.name) {
      throw new Error('Параметр "name" обязателен для поля ввода');
    }

    const {
      type = 'text',
      name,
      label = '',
      value = '',
      options = [],
      subText = '',
      required = true,
      container = this.form,
      className = '',
      validationMessage = 'Это поле обязательно для заполнения'
    } = params;

    // Создаем контейнер для группы элементов поля
    const fieldGroup = document.createElement('div');
    fieldGroup.className = `field-group ${name}-group ${className}`.trim();

    // Добавляем индикатор обязательности
    if (required) {
      fieldGroup.classList.add('required-field');
    }

    // Добавляем в указанный контейнер
    container.appendChild(fieldGroup);

    // Создаем элемент для отображения ошибок
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    
    errorElement.style.color = '#dc3545';
    errorElement.style.fontSize = '0.8em';
    errorElement.style.marginTop = '5px';
    errorElement.style.display = 'inline-block';
    errorElement.style.backgroundColor = '#ffe26cff'
    

   

    // Создаем метку (если указана)
    if (label) {
      const labelEl = document.createElement('label');
      labelEl.htmlFor = name;
      //labelEl.textContent = label + (required ? ' *' : '');
      labelEl.textContent = label;
      fieldGroup.appendChild(labelEl);
    }

    let input;
    switch (type) {
      case 'checkbox':
      case 'radio':
        input = document.createElement('input');
        input.type = type;
        if (params.checked) {
          input.checked = true;
        }
        break;

      case 'select':
        input = document.createElement('select');

        if (options.length > 0) {
          options.forEach((opt, index) => {
            const option = document.createElement('option');
            const optionValue = opt.value !== undefined ? opt.value : opt;
            const optionText = opt.text !== undefined ? opt.text : opt;

            option.value = optionValue;
            option.textContent = optionText;

            if ((value === '' && index === 0) || value === optionValue || value === index) {
              option.selected = true;
            }

            input.appendChild(option);
          });

          if (value === '' && options[0]) {
            const firstOptionValue = options[0].value !== undefined ? options[0].value : options[0];
            this.formData[name] = firstOptionValue;
          }
        }
        break;

      case 'datalist':
        input = document.createElement('input');
        input.type = 'text';
        input.setAttribute('list', `${name}-options`);

        const datalist = document.createElement('datalist');
        datalist.id = `${name}-options`;

        options.forEach(opt => {
          const option = document.createElement('option');
          option.value = typeof opt === 'object' ? opt.value : opt;
          datalist.appendChild(option);
        });

        fieldGroup.appendChild(input);
        fieldGroup.appendChild(datalist);
        break;

      case 'textarea':
        input = document.createElement('textarea');
        input.rows = 4;
        break;

      default:
        input = document.createElement('input');
        input.type = type;
    }

    // Устанавливаем общие атрибуты
    input.id = name;
    input.name = name;
    input.required = required;

    if (type !== 'select' && type !== 'datalist') {
      input.value = value;
      this.formData[name] = value;
    }

    // Добавляем элементы в DOM
    fieldGroup.appendChild(input);
    fieldGroup.appendChild(errorElement);

    if (subText) {
      const subTextEl = document.createElement('span');
      subTextEl.className = 'sub-text';
      subTextEl.textContent = subText;
      fieldGroup.appendChild(subTextEl);
    }

    // Валидация при потере фокуса
    input.addEventListener('blur', () => {
      if (required && !input.value.trim()) {
        errorElement.textContent = validationMessage;
        errorElement.style.display = 'block';
        input.style.borderColor = '#dc3545';
      } else {
        errorElement.style.display = 'none';
        input.style.borderColor = '';
      }
    });

    // Сброс ошибки при вводе
    input.addEventListener('input', (e) => {
      this.formData[name] = e.target.value;
      if (errorElement.style.display === 'block') {
        errorElement.style.display = 'none';
        input.style.borderColor = '';
      }
    });

    // Обработчик фокуса
    if (this.formData.growth || this.formData.mass)
    input.addEventListener('focus', () => {
      if (input.name === 'growth' || input.name === 'mass' || input.name === 'bsaResult') { // только при фокусе на growth || mass || bsaResult
        this.calculateBSA();
      //this.style.borderColor = '#4CAF50'; // Визуальный эффект
      this.calculateBSA(); // вызываем как метод экземпляра
      }
    });

    return input;
  }


  /**
 * Создает список динамически добавляемых полей ввода
 * @param {Object} params - Параметры списка
 * @param {string} params.name - Базовое имя для полей
 * @param {Array} params.value - Начальные значения
 * @param {Array} [params.options] - Опции для элементов списка
 * @param {HTMLElement} params.container - Контейнер для вставки
 * @returns {HTMLElement} Контейнер списка
 */
  createInputList({ name, value = [''], options, container }) {
    const listContainer = document.createElement('div');
    listContainer.className = 'input-list-container';

    // Кнопка добавления
    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.className = 'add-input-item';
    addButton.textContent = '+ Добавить';
    addButton.addEventListener('click', () => this.addInputListItem(listContainer, name));

    container.appendChild(listContainer);
    container.appendChild(addButton);

    // Добавляем начальные элементы
    value.forEach(val => this.addInputListItem(listContainer, name, val));

    return listContainer;
  }

  /**
   * Добавляет новый элемент в список ввода
   */
  addInputListItem(container, baseName, value = '') {
    const itemId = Date.now();
    const itemContainer = document.createElement('div');
    itemContainer.className = 'input-list-item';

    // Поле ввода
    const input = document.createElement('input');
    input.type = 'text';
    input.name = `${baseName}[]`;
    input.value = value;
    input.dataset.id = itemId;

    // Кнопка удаления
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-input-item';
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => itemContainer.remove());

    itemContainer.appendChild(input);
    itemContainer.appendChild(removeBtn);
    container.appendChild(itemContainer);

    // Обновляем formData при изменениях
    input.addEventListener('input', (e) => {
      this.formData[baseName] = this.getInputListValues(container, baseName);
      
   
      
    });
    
  }

  /**
   * Получает текущие значения списка
   */
  getInputListValues(container, baseName) {
    return Array.from(container.querySelectorAll('input'))
      .map(input => input.value)
      .filter(val => val.trim() !== '');
  }

  /**
   * Добавляет разделитель между полями формы
   * @returns {HTMLHRElement} Созданный разделитель
   */
  addSeparator() {
    const separator = document.createElement('div');
    separator.className = 'separator';
    separator.innerHTML = '<hr>';
    this.form.appendChild(separator);
    return separator;
  }

  // Создание разделительной линии
  addSpacer() {
    const spacer = document.createElement('div');
    spacer.className = 'line-spacer';
    spacer.innerHTML = '-'.repeat(120);
    this.form.appendChild(spacer);
    return spacer;
  }

  // Рассчет ППТ
calculateBSA() {
  // Проверяем, что оба поля заполнены  
  if (!this.formData.growth || !this.formData.mass) 
    {
    console.log("Ошибка рассчета ППТ!\nПоля не заполнены");
    return;
    }
    
  try {
    const growth = parseFloat(this.formData.growth);
    const mass = parseFloat(this.formData.mass);

    if (isNaN(growth) || isNaN(mass)) return; //не число - выходим

    // Формула Дюбуа
    const bsa = 0.007184 * Math.pow(growth, 0.725) * Math.pow(mass, 0.425);
    this.formData.bsaResult = bsa.toFixed(2); // Сохраняем результат

    // Обновляем поле с результатом (если оно есть)
    this.updateResultField();

    console.log('ППТ = ', this.formData.bsaResult);
  } catch (e) {
    console.error('Ошибка расчёта ППТ', e);
  }
    
}

// Обнолвение поля рассчета ППТ
updateResultField() {
  const resultField = document.getElementById('bsaResult');
  if (resultField && this.formData.bsaResult !== undefined) {
    resultField.value = this.formData.bsaResult;
    // Добавляем визуальное выделение при обновлении
    resultField.style.backgroundColor = '#d1ffd1ff';
    setTimeout(() => resultField.style.backgroundColor = '', 700);
  }
}

  /**
   * Статический метод для получения текущей даты
   * @returns {string} Дата в формате 'dd.mm.yyyy'
   */
  
  static getCurrentDate() {
    const now = new Date();
    const pad = num => num.toString().padStart(2, '0');
    return `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()}`;
  }
/*
  // Установка текущей даты в формате DD.MM.YYYY
  static setCurrentDate() {
    const now = new Date();
    const day = ("0" + now.getDate()).slice(-2);
    const month = ("0" + (now.getMonth() + 1)).slice(-2);
    const year = now.getFullYear().toString();
    return `${day}.${month}.${year}`;
   
  }
  */


  /**
   * Статический метод получения и (опционального) округления текущего времени (до десятков минут)
 * @param {boolean} isRound  если true, минуты будут округлены до ближайшей десятки
 * @returns {string}  строка вида "HH:MM"
 */
  static setCurrentTimeRounded(isRound) {
    const now = new Date();

    // 1) Получаем часы и минуты
    let hours = now.getHours();     // 0–23
    let minutes = now.getMinutes();   // 0–59
    let rounded = minutes;            // по умолчанию — без округления

    // флаг для текста в консоли
    let message = "";

    if (isRound) {
      // 2) Округление минут до десятков
      rounded = Math.round(minutes / 10) * 10;  // 0,10,20,...,60

      // 3) Если получилось 60 → сбрасываем и переходим на следующий час
      if (rounded === 60) {
        rounded = 0;
        hours = (hours + 1) % 24;
      }

      message = " (округлено до десятков минут)";
    }

    // 4) Приводим часы и минуты к двум цифрам
    const hh = String(hours).padStart(2, '0');
    const mm = String(rounded).padStart(2, '0');

    const result = `${hh}:${mm}`;
    console.log(`Текущее время${message}:`, result);

    return result;
  }
  ///////////////////////////////////////////////////////////////////////////////
  /**
 * Инициализация функционала копирования
 * @param {string} buttonId - ID кнопки копирования
 */
  initCopyFunct(buttonId = 'copyButton') {
    const button = document.getElementById(buttonId);
    if (button) {
      button.addEventListener('click', () => this.copyFormText());
    } else {
      console.warn(`Кнопка с ID "${buttonId}" не найдена`);
    }
  }

  /**
 * Инициализация функционала сохранения
 * @param {string} buttonId - ID кнопки копирования
 */
  initSaveFunct(buttonId = 'saveButton') {
    const button = document.getElementById(buttonId);
    if (button) {
      button.addEventListener('click', () => this.saveToLocalStorage());
    } else {
      console.warn(`Кнопка с ID "${buttonId}" не найдена`);
    }
  }

  /**
 * Инициализация функционала сохранения
 * @param {string} buttonId - ID кнопки копирования
 */
  initClearFunct(buttonId = 'clearButton') {
    const button = document.getElementById(buttonId);
    if (button) {
      button.addEventListener('click', () => this.clearLocalStorage());
    } else {
      console.warn(`Кнопка с ID "${buttonId}" не найдена`);
    }
  }
  /**
   * Асинхронно копирует текст формы в буфер обмена
   * Выполняет последовательность операций:
   * 1. Получает сырой текст из формы
   * 2. Форматирует текст согласно правилам
   * 3. Копирует в буфер обмена
   * 4. Уведомляет пользователя о результате
   * @async
   * @returns {Promise<void>}
   * @throws {Error} Если возникла ошибка на любом из этапов
   */
  async copyFormText() {
    try {
      // 1. Получение сырого текста из формы
      // Вызываем метод getFormText(), который собирает все данные формы
      // и возвращает их в виде неформатированной строки
      const rawText = this.getFormText();

      // 2. Форматирование текста
      // Передаем сырой текст в метод formatText(), который:
      // - Добавляет точки в конец строк где нужно
      // - Обрабатывает разделители
      // - Форматирует группы полей
      const formattedText = this.formatText(rawText);

      // 3. Копирование в буфер обмена
      // Используем асинхронный метод copyToClipboard()
      // await гарантирует что код будет ждать завершения операции
      await this.copyToClipboard(formattedText);

      // 4. Уведомление об успехе
      // Если копирование прошло успешно, показываем уведомление
      this.showCopySuccess();
      this.saveToLocalStorage();
    } catch (error) {
      // Обработка ошибок
      // Если на любом этапе возникла ошибка:
      // 1. Логируем ошибку в консоль
      // 2. Показываем пользователю сообщение об ошибке
      this.showCopyError(error);

      // Пробрасываем ошибку дальше, если нужно обработать её на более высоком уровне
      // throw error; // Раскомментировать если нужно
    }
  }
  //////////////////////////////////////////////////////////////
  /**
  * Собирает текстовое представление данных формы
  * @returns {string} Отформатированный текст формы
  * 
  * Метод getFormText() анализирует только:
  * Элементы с классами field-group, separator, line-spacer, form-header.
  * Элементы внутри групп полей (например, input, select, textarea с метками).
  * Элементы с префиксом proc в классе (если вы используете hasClassWithPrefix).
  */
  getFormText() {
    // Инициализируем переменную для хранения результата
    let result = '';

    /**
     * Проверяет, содержит ли элемент класс с указанным префиксом
     * @param {HTMLElement} element - DOM-элемент для проверки
     * @param {string} prefix - Префикс для поиска в классах
     * @returns {boolean} True если найден класс с префиксом
     */
    const hasClassWithPrefix = (element, prefix) => {
      // Преобразуем classList в массив и проверяем каждый класс
      return [...element.classList].some(className => className.startsWith(prefix));
    };

    /**
     * Обрабатывает отдельный DOM-элемент формы и возвращает его текстовое представление
     * @param {HTMLElement} element - Элемент формы для обработки
     * @returns {string} Текстовое представление элемента
     */
    const processElement = (element) => {
      // Обработка разделителя (сепаратора)
      if (element.classList.contains('separator')) {
        // Возвращаем строку из 120 дефисов с переносами
        return '\n' + '-'.repeat(120) + '\n';
      }

      // Обработка линейного разделителя
      if (element.classList.contains('line-spacer')) {
        // Возвращаем строку из 120 дефисов
        return '-'.repeat(120) + '\n';
      }

      // Обработка заголовка формы
      if (element.classList.contains('form-header')) {
        // Проверяем, что элемент существует и содержит текст
        if (element && element.textContent && element.textContent.trim() !== '') {
          // Возвращаем текст заголовка с двоеточием и переносом
          return element.textContent.trim() + ':\n';
        }
        // Для пустых заголовков возвращаем 
        return '';
      }
      // Проверка на классы с префиксом 'proc'
      if (hasClassWithPrefix(element, 'proc')) {
        return element.textContent.trim() + '\n';
      }
      // Обработка группы полей или элементов 
      if (element.classList.contains('field-group')) {
        // Находим связанные элементы внутри группы
        const labelEl = element.querySelector('label');
        const inputEl = element.querySelector('input, select, textarea');
        const subTextEl = element.querySelector('.sub-text');

        // Если есть поле ввода
        if (inputEl) {
          // Получаем текст метки (если есть), удаляем двоеточие в конце
          const label = labelEl ? labelEl.textContent.replace(/:$/, '').trim() : '';

          // Получаем значение поля
          let value = inputEl.value.trim();

          // Особый случай для SELECT - берем текст выбранной опции
          if (inputEl.tagName === 'SELECT') {
            const selectedOption = inputEl.options[inputEl.selectedIndex];
            value = selectedOption.text.trim();
          }

          // Получаем дополнительный текст (если есть)
          const subText = subTextEl ? subTextEl.textContent.trim() : '';

          // Формируем строку содержимого
          const lineContent = label
            ? `${label}: ${value}${subText ? ' ' + subText : ''}` // Если есть метка
            : value; // Если нет метки

          // Добавляем точку в конце и перенос строки
          return this.ensureEndsWithDot(lineContent) + '\n';
        }
      }

      // Для всех остальных элементов возвращаем пустую строку
      return '';
    };

    // Обрабатываем все элементы формы и ее дочерние контейнеры
    const processContainer = (container) => {
      // Перебираем все дочерние узлы
      container.childNodes.forEach(node => {
        // Пропускаем все не-элементы (текстовые узлы и т.д.)
        if (node.nodeType !== 1) return;

        // Обрабатываем текущий элемент и добавляем результат
        result += processElement(node);

        // Рекурсивно обрабатываем вложенные контейнеры
        if (hasClassWithPrefix(node, 'section')) {

        }
          /* ||
           node.classList.contains('medical-examination-container') ||
           node.classList.contains('flex-container') ||
           node.classList.contains('flex-left') ||
           node.classList.contains('flex-right')) 
           */ 
          processContainer(node);
      
      });
    };

    // Начинаем обработку с основной формы
    processContainer(this.form);

    // Возвращаем результат, удаляя лишние пробелы в начале/конце
    return result.trim();
  }
  ///////////////////////////////////////////////
  /**
  * Форматирует текст с учетом заголовков, разделителей и группировки строк
  * @param {string} text - Сырой текст из формы
  * @returns {string} Отформатированный текст
  */
  formatText(text) {
    // 1. Разделяем текст на строки
    const lines = text.split('\n');
    let result = '';
    let separatorCount = 0;
    let inTargetSection = false;
    let currentGroup = [];
    let isAfterHeader = false;

    // 2. Обрабатываем каждую строку
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      // 2.1. Пропускаем пустые строки
      if (!line) continue;

      // 2.2. Обработка заголовков (строк с #)
      if (line.includes('#')) {
        // 2.2.1. Сбрасываем текущую группу перед заголовком
        if (currentGroup.length > 0) {
          result += this.formatLineGroup(currentGroup.join('\n')) + '\n';
          currentGroup = [];
        }

        // 2.2.2. Удаляем символы # и форматируем заголовок
        line = line.replace(/#/g, '').trim();
        result += line + '\n';
        isAfterHeader = true;
        continue;
      }

      // 2.3. Добавляем пустую строку после заголовка
      /*if (isAfterHeader) {
        result += '\n';
        isAfterHeader = false;
      }
      */
      // 2.4. Обработка разделителей
      if (line.startsWith('----')) {
        separatorCount++;

        // 2.4.1. Обрабатываем накопленные строки перед разделителем
        if (currentGroup.length > 0) {
          result += this.formatLineGroup(currentGroup.join('\n')) + '\n';
          currentGroup = [];
        }

        // 2.4.2. Определяем целевую секцию (между 2-м и 3-м разделителями)
        inTargetSection = separatorCount >= 2 && separatorCount < 3;

        result += line + '\n\n';
        continue;
      }

      // 2.5. Обработка строк внутри целевой секции
      if (inTargetSection) {
        currentGroup.push(this.ensureEndsWithDot(line));
      }
      // 2.6. Обработка строк вне целевой секции
      else {
        result += this.ensureEndsWithDot(line) + '\n';
      }
    }

    // 3. Обработка оставшихся строк в группе
    if (currentGroup.length > 0) {
      result += this.formatLineGroup(currentGroup.join('\n'));
    }

    return result.trim();
  }

  /**
   * Форматирует группу строк (объединяет по 2 предложения)
   * @param {string} group - Группа строк для форматирования
   * @returns {string} Отформатированный текст
   */
  /*
  formatLineGroup(group) {
    // 1. Разбиваем на отдельные строки и фильтруем пустые
    const lines = group.split('\n').filter(line => line.trim());

    // 2. Объединяем строки попарно
    let result = '';
    for (let i = 0; i < lines.length; i += 2) {
      const line1 = lines[i];
      const line2 = lines[i + 1] || ''; // Если нет второй строки - пустая строка
      result += line1 + ' ' + line2 + '\n';
    }

    return result.trim();
  }
*/
  /**
   * Добавляет точку в конец строки если её нет
   * @param {string} line - Входная строка
   * @returns {string} Строка с точкой в конце
   */
  ensureEndsWithDot(line) {
    // 1. Удаляем пробелы в начале и конце строки
    const trimmed = line.trim();

    // 2. Проверяем, заканчивается ли строка на .!?,
    if (!/[.!?,:]$/.test(trimmed)) {
      // 3. Если нет - добавляем точку
      return trimmed + '.';
    }

    // 4. Если уже есть подходящий знак препинания - возвращаем как есть
    return trimmed;
  }

  /**
 * Форматирование группы строк (блока текста между разделителями)
 * Обрабатывает блок текста, объединяя строки попарно и добавляя пунктуацию
 * @param {string} group - Группа строк для форматирования
 * @returns {string} Отформатированный текст
 * @private
 */

  formatLineGroup(group) {
    // 1. Подготовка строк:
    // - Разбиваем текст на массив строк по символу перевода строки
    // - Фильтруем пустые строки (содержащие только пробелы)
    // - Для каждой строки добавляем точку в конце при необходимости
    const processedLines = group.split('\n')
      .filter(line => line.trim()) // Удаляем пустые строки
      .map(line => this.ensureEndsWithDot(line)); // Добавляем точки

    // 2. Попарное объединение строк:
    // - Инициализируем переменную для результата
    let result = '';

    // - Проходим по массиву с шагом 2 (каждые две строки)
    for (let i = 0; i < processedLines.length; i += 2) {
      // Берем текущую строку и следующую (или пустую строку если следующей нет)
      const line1 = processedLines[i];
      const line2 = processedLines[i + 1] || ''; // Защита от undefined

      // Объединяем строки через пробел и добавляем перевод строки
      result += line1 + ' ' + line2 + '\n';
    }

    // 3. Возвращаем отформатированный текст
    return result;
  }



  /*
   * Копирование текста в буфер обмена
   * @private
   */
  async copyToClipboard(text) {
    await navigator.clipboard.writeText(text);
  }

  /*
   * Показать уведомление об успешном копировании
   * @private
   */
  showCopySuccess() {
    console.log("Текст скопирован в буфер обмена!");
    alert("Текст скопирован в буфер обмена!");
  }

  /*
   * Показать ошибку копирования
   * @private
   */
  showCopyError(error) {
    console.error("Ошибка при копировании:", error);
    alert("Ошибка при копировании текста");
  }


  ////////////////////////////////////////////////////
  /*
     * Удаление элемента формы по имени
     * @param {string} name - Имя поля
     */
  removeField(name) {
    const group = this.form.querySelector(`.${name}-group`);
    if (group) group.remove();
  }

  /*
   * Очистка всей формы
   */
  clearForm() {
    this.form.innerHTML = '';
    this.formData = {};
  }

  /**
   * Получение данных формы в виде объекта
   */
  getFormData() {
    const data = {};
    Object.keys(this.formData).forEach(key => {
      const input = this.form.querySelector(`[name="${key}"]`);
      if (input) {
        data[key] = input.type === 'checkbox' ? input.checked : input.value;
      }
    });
    return data;
  }
  ///////////////////////////////////////////
  /**
   * Статический метод для рендера навигационного списка.
   * @param {string} targetSelector — CSS-селектор контейнера, куда вставить меню.
   * @param {Array<{href:string, text:string}>} arrayItems — массив объектов {href, text}.
   */
  static renderNavList(targetSelector, arrayItems) {
    const target = document.querySelector(targetSelector);
    if (!target) {
      console.error("Целевой элемент не найден:", targetSelector);
      return;
    }

    // 1) создаём div-контейнер с нужным классом
    const container = document.createElement("div");
    container.classList.add("nav-container");

    // 2) создаём UL
    const ul = document.createElement("ul");

    // 3) заполняем его LI из массива arrayItems
    arrayItems.forEach(item => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = item.href;
      a.textContent = item.text;
      li.appendChild(a);
      ul.appendChild(li);
    });

    // 4) собираем и вставляем
    container.appendChild(ul);
    target.appendChild(container);
  }


} // end class

// Универсальный экспорт для разных сред
if (typeof module !== 'undefined' && module.exports) {
  // Для Node.js/CommonJS
  module.exports = Page;
} else {
  // Для браузера (глобальная переменная)
  window.Page = Page;
}
