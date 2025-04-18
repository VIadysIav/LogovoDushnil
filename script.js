/**
 * LogovoDushnil - Основные скрипты сайта
 * Оптимизированная версия
 */

// ----- ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ -----
document.addEventListener('DOMContentLoaded', function() {
    // Флаг для отслеживания процесса навигации
    window.isNavigating = false;
    
    // Инициализация компонентов
    createImageModal();      // Создаем модальное окно для просмотра изображений
    setupImageViewers();     // Настраиваем просмотрщики изображений
    loadSavedTheme();        // Загружаем сохраненную тему
    setupEventHandlers();    // Устанавливаем обработчики событий
    initFullscreenPageSystem(); // Инициализируем систему полноэкранных страниц
    setupExpandableGrids();  // Настраиваем расширяемые сетки

    // Обработчик для навигации по истории (кнопка "назад")
    window.addEventListener('popstate', handlePopState);
    
    // Обработка текущего URL при загрузке страницы
    processCurrentUrl();
    
    // Инициализация видеоплеера, если он есть на странице
    initVideoPlayers();
});

// ----- ФУНКЦИИ ИНИЦИАЛИЗАЦИИ -----

/**
 * Инициализирует видеоплееры на странице
 */
function initVideoPlayers() {
    if (typeof videojs !== 'undefined') {
        const videoElements = document.querySelectorAll('.video-js');
        videoElements.forEach(element => {
            if (!element.player) {
                videojs(element.id, {
                    controls: true,
                    preload: 'auto'
                });
            }
        });
    }
}

/**
 * Создает модальное окно для просмотра изображений
 */
function createImageModal() {
    // Проверяем, существует ли уже модальное окно
    if (document.querySelector('.image-modal')) {
        return;
    }
    
    // Создаем элементы модального окна
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const closeButton = document.createElement('span');
    closeButton.className = 'close-modal';
    closeButton.innerHTML = '&times;';
    
    const modalImage = document.createElement('img');
    
    // Собираем структуру модального окна
    modalContent.appendChild(modalImage);
    modal.appendChild(closeButton);
    modal.appendChild(modalContent);
    
    // Добавляем в документ
    document.body.appendChild(modal);
    
    // Добавляем обработчики событий
    closeButton.onclick = function() {
        closeModal(modal, modalContent, closeButton);
    };
    
    modal.onclick = function(event) {
        if (event.target === modal) {
            closeModal(modal, modalContent, closeButton);
        }
    };
    
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.classList.contains('show')) {
            closeModal(modal, modalContent, closeButton);
        }
    });
}

/**
 * Закрывает модальное окно для просмотра изображений
 */
function closeModal(modal, modalContent, closeButton) {
    // Плавно скрываем элементы
    modalContent.classList.remove('show');
    closeButton.classList.remove('show');
    
    // Через 300мс скрываем модальное окно
    setTimeout(function() {
        modal.classList.remove('show');
        
        // Через 300мс скрываем полностью
        setTimeout(function() {
            modal.style.display = 'none';
        }, 300);
    }, 300);
}

/**
 * Настраивает просмотрщики изображений для всех страниц
 */
function setupImageViewers() {
    // Настраиваем для всех контейнеров
    setupImageViewersForContainer(document.body);
    
    // Настраиваем переинициализацию при навигации
    window.setupImageViewersForContainer = setupImageViewersForContainer;
    
    // Переопределяем функцию showPage для вызова reinitializeImageViewers
    const originalShowPage = window.showPage || function() {};
    window.showPage = function(pageName, categoryName) {
        originalShowPage(pageName, categoryName);
        setTimeout(reinitializeImageViewers, 300);
    };
}

/**
 * Настраивает просмотрщики изображений для конкретного контейнера
 */
function setupImageViewersForContainer(container) {
    const images = container.querySelectorAll('.post-image');
    const modal = document.querySelector('.image-modal');
    
    if (!modal || images.length === 0) return;
    
    const modalContent = modal.querySelector('.modal-content');
    const closeButton = modal.querySelector('.close-modal');
    const modalImg = modal.querySelector('.modal-content img');
    
    // Добавляем обработчики для всех изображений
    images.forEach(img => {
        // Удаляем существующие обработчики, если они есть
        const newImg = img.cloneNode(true);
        img.parentNode.replaceChild(newImg, img);
        
        // Добавляем новый обработчик
        newImg.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Показываем модальное окно и устанавливаем изображение
            modal.style.display = 'flex';
            modalImg.src = this.src;
            
            // Запускаем анимацию появления
            setTimeout(function() {
                modal.classList.add('show');
                
                setTimeout(function() {
                    modalContent.classList.add('show');
                    closeButton.classList.add('show');
                }, 10);
            }, 10);
        };
    });
}

/**
 * Переинициализирует просмотрщики изображений
 */
function reinitializeImageViewers() {
    // Настраиваем просмотрщик для всех основных страниц
    setupImageViewersForContainer(document.querySelector('.home-page'));
    setupImageViewersForContainer(document.querySelector('.feed-page'));
    
    // Настраиваем для всех категорий
    document.querySelectorAll('.category-page').forEach(categoryPage => {
        setupImageViewersForContainer(categoryPage);
    });
    
    // Настраиваем для полноэкранной страницы
    setupImageViewersForContainer(document.getElementById('fullscreen-page-container'));
}

/**
 * Загружает сохраненную тему из localStorage
 */
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        const body = document.body;
        const themeToggle = document.getElementById('theme-toggle');
        
        if (savedTheme === 'light') {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            if (themeToggle) themeToggle.checked = true;
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            if (themeToggle) themeToggle.checked = false;
        }
    }
}

/**
 * Устанавливает все обработчики событий на странице
 */
function setupEventHandlers() {
    // Переключение на главную страницу при клике на логотип
    const homeLink = document.getElementById('home-link');
    if (homeLink) {
        homeLink.addEventListener('click', function(e) {
            e.preventDefault();
            navigateTo('main', 'home');
        });
    }
    
    // Переключение между страницами в меню
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Проверяем, не является ли эта страница уже активной
            if (this.classList.contains('active')) {
                return;
            }
            
            const pageName = this.getAttribute('data-page');
            
            if (pageName === 'home') {
                navigateTo('main', 'home');
            } else if (pageName === 'feed') {
                navigateTo('list', 'feed');
            }
        });
    });
    
    // Переключение на контент категории 
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const categoryName = this.getAttribute('data-category');
            navigateTo('category/' + categoryName, 'category', categoryName);
        });
    });
    
    // Обработчик для кнопки "назад" в категориях
    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Перед возвратом к списку категорий, проверяем расширенный элемент
            const currentCategoryPage = button.closest('.category-page');
            if (currentCategoryPage) {
                // Применяем анимацию закрытия страницы категории
                currentCategoryPage.classList.remove('active-animation');
                
                // Задержка перед скрытием страницы и переходом в ленту
                setTimeout(() => {
                    resetCategoryPageState(currentCategoryPage);
                    
                    // Переходим к списку категорий
                    navigateTo('list', 'feed');
                }, 150);
            } else {
                // Сразу переходим к списку категорий
                navigateTo('list', 'feed');
            }
        });
    });
    
    // Функция сброса состояния страницы категории
    function resetCategoryPageState(categoryPage) {
        const expandableGrid = categoryPage.querySelector('.expandable-grid');
        if (expandableGrid) {
            // Сбрасываем все расширенные элементы
            const expandedItems = expandableGrid.querySelectorAll('.expandable-item.expanded');
            expandedItems.forEach(item => {
                item.classList.remove('expanded');
                item.classList.remove('animating');
                
                // Скрываем расширенное содержимое
                const expandedContent = item.querySelector('.item-expanded-content');
                if (expandedContent) {
                    expandedContent.style.display = 'none';
                    expandedContent.style.opacity = '0';
                    expandedContent.style.transform = 'scale(0.95)';
                }
            });
            
            // Сбрасываем высоту сетки
            expandableGrid.style.height = '';
            
            // Восстанавливаем видимость всех элементов
            resetGridItemsVisibility(expandableGrid);
        }
    }
    
    // Восстановление видимости элементов сетки
    function resetGridItemsVisibility(grid) {
        const gridItems = grid.querySelectorAll('.expandable-item');
        gridItems.forEach(item => {
            // Удаляем все встроенные стили
            item.removeAttribute('style');
            
            // Принудительно показываем превью
            const preview = item.querySelector('.item-preview');
            if (preview) {
                preview.style.display = 'flex';
                preview.style.opacity = '1';
                
                // Восстанавливаем изображение
                const image = preview.querySelector('.item-image');
                if (image) {
                    image.style.display = 'block';
                    image.style.opacity = '1';
                    image.style.height = '120px';
                    image.style.maxHeight = '120px';
                    image.style.visibility = 'visible';
                }
                
                // Восстанавливаем детали
                const details = preview.querySelector('.item-details');
                if (details) {
                    details.style.display = 'block';
                    details.style.opacity = '1';
                }
            }
        });
    }
    
    // Функциональность переключения темы
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', function() {
            const body = document.body;
            
            if (this.checked) {
                // Переключаемся на светлую тему
                body.classList.remove('dark-theme');
                body.classList.add('light-theme');
            } else {
                // Переключаемся на темную тему
                body.classList.remove('light-theme');
                body.classList.add('dark-theme');
            }
            
            // Сохраняем тему в localStorage
            localStorage.setItem('theme', body.classList.contains('light-theme') ? 'light' : 'dark');
        });
    }
    
    // Добавляем обработчики для копирования кода
    setupCodeCopyButtons();
}

/**
 * Настраивает кнопки копирования кода
 */
function setupCodeCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(button => {
        // Удаляем существующие обработчики
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Добавляем новый обработчик
        newButton.addEventListener('click', function() {
            const codeBlock = this.closest('.code-container').querySelector('pre code');
            const text = codeBlock.textContent;
            
            navigator.clipboard.writeText(text).then(() => {
                const originalText = this.textContent;
                this.textContent = 'Скопировано!';
                
                setTimeout(() => {
                    this.textContent = originalText;
                }, 2000);
            }).catch(err => {
                console.error('Ошибка копирования: ', err);
            });
        });
    });
}

/**
 * Обрабатывает событие popstate (нажатие кнопки "назад" в браузере)
 */
function handlePopState(event) {
    // Если мы уже в процессе навигации, пропускаем обработку
    if (window.isNavigating) return;
    
    // Устанавливаем флаг навигации
    window.isNavigating = true;
    
    // Проверяем, открыта ли полноэкранная страница
    const fullscreenPage = document.querySelector('.fullscreen-page-container.active');
    if (fullscreenPage) {
        // Закрываем полноэкранную страницу без обновления истории
        closeFullscreenPage(false);
        
        // Обрабатываем текущий URL после закрытия
        setTimeout(() => {
            processCurrentUrl();
            
            // Сбрасываем флаг навигации через задержку
            setTimeout(() => {
                window.isNavigating = false;
            }, 100);
        }, 250);
    } else {
        // Находим текущую открытую страницу категории
        const currentCategoryPage = document.querySelector('.category-page[style*="display: block"]');
        
        // Проверяем переход от категории к списку категорий
        if (currentCategoryPage && window.location.hash === '#list') {
            // Анимация закрытия страницы категории
            currentCategoryPage.classList.remove('active-animation');
            
            // Обрабатываем текущий URL после задержки
            setTimeout(() => {
                processCurrentUrl();
                
                // Сбрасываем флаг навигации
                setTimeout(() => {
                    window.isNavigating = false;
                }, 50);
            }, 150);
        } else {
            // Обрабатываем текущий URL
            processCurrentUrl();
            
            // Сбрасываем флаг навигации
            setTimeout(() => {
                window.isNavigating = false;
            }, 100);
        }
    }
}

/**
 * Обрабатывает текущий URL и выполняет навигацию
 */
function processCurrentUrl() {
    // Получаем хеш из URL
    const hash = window.location.hash;
    
    // Определяем страницу для показа
    let pageName = 'home';
    let categoryName = null;
    let itemId = null;
    
    if (!hash || hash === '#' || hash === '#main') {
        pageName = 'home';
    } else if (hash === '#list') {
        pageName = 'feed';
    } else if (hash.startsWith('#category/')) {
        pageName = 'category';
        // Извлекаем имя категории из URL
        categoryName = hash.split('/')[1];
    } else if (hash.startsWith('#item/')) {
        // Обработка прямых ссылок на элементы
        const parts = hash.split('/');
        if (parts.length >= 3) {
            pageName = 'category';
            categoryName = parts[1];
            itemId = parts[2];
        }
    }
    
    // Показываем нужную страницу
    showPage(pageName, categoryName);
    
    // Обновляем заголовок страницы
    updatePageTitle(pageName, categoryName);
    
    // Если мы на странице категории, загружаем элементы
    if (pageName === 'category') {
        setTimeout(() => {
            loadCategory(categoryName, itemId);
        }, 100);
        
        // Инициализируем сетки на активной странице
        setTimeout(() => {
            const activePage = document.getElementById(categoryName + '-page');
            if (activePage) {
                setupExpandableGrids(activePage.querySelectorAll('.expandable-grid'));
            }
        }, 200);
    }
}

/**
 * Загружает содержимое страницы категории
 */
function loadCategory(categoryName, itemId = null) {
    // Находим страницу категории
    const categoryPage = document.getElementById(categoryName + '-page');
    if (!categoryPage) return;
    
    // Находим сетку элементов
    const expandableGrid = categoryPage.querySelector('.expandable-grid');
    if (!expandableGrid) return;
    
    // Сбрасываем все ранее открытые элементы
    resetExpandableGrid(expandableGrid);
    
    // Добавляем обработчики просмотра изображений
    setupImageViewersForContainer(categoryPage);
    
    // Если указан ID элемента, открываем его
    if (itemId) {
        // Небольшая задержка для загрузки страницы
        setTimeout(() => {
            const itemToOpen = expandableGrid.querySelector(`.expandable-item[data-category="${itemId}"]`);
            if (itemToOpen) {
                openFullscreenPage(itemToOpen, false);
            }
        }, 200);
    }
}

/**
 * Сбрасывает состояние расширяемой сетки
 */
function resetExpandableGrid(grid) {
    // Сбрасываем все расширенные элементы
    const expandedItems = grid.querySelectorAll('.expandable-item.expanded');
    expandedItems.forEach(item => {
        item.classList.remove('expanded');
        item.classList.remove('animating');
        
        // Скрываем расширенное содержимое
        const expandedContent = item.querySelector('.item-expanded-content');
        if (expandedContent) {
            expandedContent.style.display = 'none';
            expandedContent.style.opacity = '0';
            expandedContent.style.transform = 'scale(0.95)';
        }
    });
    
    // Сбрасываем высоту сетки
    grid.style.height = '';
    
    // Восстанавливаем видимость всех элементов
    const gridItems = grid.querySelectorAll('.expandable-item');
    gridItems.forEach(item => {
        // Удаляем все встроенные стили
        item.removeAttribute('style');
        
        // Восстанавливаем превью и его содержимое
        const preview = item.querySelector('.item-preview');
        if (preview) {
            preview.style.display = 'flex';
            preview.style.opacity = '1';
            
            // Восстанавливаем изображение
            const image = preview.querySelector('.item-image');
            if (image) {
                image.style.display = 'block';
                image.style.opacity = '1';
                image.style.height = '120px';
                image.style.maxHeight = '120px';
                image.style.visibility = 'visible';
            }
            
            // Восстанавливаем детали
            const details = preview.querySelector('.item-details');
            if (details) {
                details.style.display = 'block';
                details.style.opacity = '1';
            }
        }
    });
}

/**
 * Обновляет заголовок страницы
 */
function updatePageTitle(pageName = 'home', categoryName = null) {
    document.title = 'LogovoDushnil';
}

/**
 * Инициализирует все расширяемые сетки на странице
 */
function setupExpandableGrids(selectorOrElements) {
    let grids;
    
    if (!selectorOrElements) {
        // По умолчанию ищем все сетки
        grids = document.querySelectorAll('.expandable-grid');
    } else if (typeof selectorOrElements === 'string') {
        // Если передан селектор, находим элементы
        grids = document.querySelectorAll(selectorOrElements);
    } else {
        // Если передана коллекция элементов
        grids = selectorOrElements;
    }
    
    if (grids.length === 0) {
        return;
    }
    
    // Обрабатываем каждую найденную сетку
    grids.forEach(grid => {
        const items = grid.querySelectorAll('.expandable-item');
        if (items.length === 0) {
            return;
        }
        
        // Подготовка всех элементов
        prepareExpandableItems(grid, items);
        
        // Добавляем обработчики событий
        attachExpandableItemHandlers(grid, items);
    });
}

/**
 * Подготавливает расширяемые элементы
 */
function prepareExpandableItems(grid, items) {
    items.forEach(item => {
        const expandedContent = item.querySelector('.item-expanded-content');
        if (!expandedContent) {
            return;
        }
        
        // Устанавливаем стили для скрытого состояния
        expandedContent.style.display = 'none';
        expandedContent.style.opacity = '0';
        expandedContent.style.transform = 'scale(0.95)';
        
        // Сбрасываем стили элемента
        item.removeAttribute('style');
        
        // Восстанавливаем превью
        const preview = item.querySelector('.item-preview');
        if (preview) {
            preview.style.display = 'flex';
            preview.style.opacity = '1';
            
            // Фиксируем размеры изображения
            const image = preview.querySelector('.item-image');
            if (image) {
                image.style.height = '120px';
                image.style.maxHeight = '120px';
            }
        }
    });
}

/**
 * Добавляет обработчики событий для расширяемых элементов
 */
function attachExpandableItemHandlers(grid, items) {
    items.forEach(item => {
        // Проверяем наличие превью
        const previewElement = item.querySelector('.item-preview');
        if (previewElement) {
            // Удаляем существующие обработчики для предотвращения дублирования
            const newPreviewElement = previewElement.cloneNode(true);
            previewElement.parentNode.replaceChild(newPreviewElement, previewElement);
            
            // Добавляем новый обработчик клика
            newPreviewElement.addEventListener('click', () => {
                // Вместо раскрытия на месте, открываем полноэкранную страницу
                openFullscreenPage(item);
            });
        }
    });
}

/**
 * Инициализирует систему полноэкранных страниц
 */
function initFullscreenPageSystem() {
    // Проверяем наличие контейнера
    let container = document.getElementById('fullscreen-page-container');
    
    // Если контейнер отсутствует, создаем его
    if (!container) {
        container = document.createElement('div');
        container.id = 'fullscreen-page-container';
        container.className = 'fullscreen-page-container';
        container.setAttribute('tabindex', '-1'); // Делаем фокусируемым
        
        const headerDiv = document.createElement('div');
        headerDiv.className = 'fullscreen-page-header';
        
        const backButton = document.createElement('button');
        backButton.className = 'back-to-category-btn';
        backButton.innerHTML = '<b><h3>🠔 Назад</h3></b>';
        backButton.setAttribute('aria-label', 'Вернуться к категории');
        
        const pageTitle = document.createElement('h2');
        pageTitle.className = 'fullscreen-page-title';
        pageTitle.textContent = 'Название страницы';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'fullscreen-page-content';
        
        // Собираем структуру
        headerDiv.appendChild(backButton);
        headerDiv.appendChild(pageTitle);
        container.appendChild(headerDiv);
        container.appendChild(contentDiv);
        
        // Добавляем в документ
        document.body.appendChild(container);
    }
}

/**
 * Открывает полноэкранную страницу
 */
function openFullscreenPage(item, updateHistory = true) {
    // Проверяем, не находимся ли мы в процессе навигации
    if (window.isNavigating) return;
    
    // Устанавливаем флаг навигации
    window.isNavigating = true;
    
    // Получаем необходимые элементы
    const pageContainer = document.getElementById('fullscreen-page-container');
    const pageTitle = document.querySelector('.fullscreen-page-title');
    const pageContent = document.querySelector('.fullscreen-page-content');
    
    if (!pageContainer || !pageTitle || !pageContent) {
        console.error('Элементы полноэкранной страницы не найдены');
        window.isNavigating = false;
        return;
    }
    
    // Получаем данные из элемента
    const expandedContent = item.querySelector('.item-expanded-content');
    const title = item.querySelector('.item-title').textContent;
    const categoryId = item.getAttribute('data-category');
    const categoryPage = item.closest('.category-page');
    let categoryName = '';
    
    if (categoryPage) {
        const categoryTitle = categoryPage.querySelector('.category-title');
        if (categoryTitle) {
            categoryName = categoryTitle.textContent;
        }
    }
    
    if (!expandedContent) {
        console.error('Содержимое для отображения не найдено');
        window.isNavigating = false;
        return;
    }
    
    // Клонируем содержимое
    const contentClone = expandedContent.cloneNode(true);
    
    // Очищаем и заполняем контейнер
    pageContent.innerHTML = '';
    pageContent.appendChild(contentClone);
    
    // Показываем клонированное содержимое
    contentClone.style.display = 'block';
    contentClone.style.opacity = '1';
    contentClone.style.transform = 'scale(1)';
    
    // Устанавливаем заголовок
    pageTitle.textContent = title;
    
    // Обновляем URL
    if (updateHistory) {
        const categoryPageMatch = categoryPage.id.match(/(.+)-page/);
        if (categoryPageMatch && categoryPageMatch[1]) {
            const categoryUrlId = categoryPageMatch[1];
            // Изменяем хеш URL
            history.pushState(
                { type: 'item', category: categoryUrlId, item: categoryId },
                '',
                `#item/${categoryUrlId}/${categoryId}`
            );
        }
    }
    
    // Сохраняем текущее положение прокрутки
    window.fullscreenPageScrollPos = window.scrollY;
    
    // Отображаем полноэкранную страницу
    pageContainer.style.display = 'block';
    
    // Добавляем класс активности
    setTimeout(() => {
        pageContainer.classList.add('active');
        
        // Прокручиваем в начало
        pageContainer.scrollTop = 0;
        
        // Блокируем прокрутку основной страницы
        document.querySelector('.main-content').style.overflow = 'hidden';
        
        // Настраиваем просмотр изображений
        setupImageViewersForContainer(pageContainer);
        
        // Настраиваем копирование кода
        setupCodeCopyButtons();
        
        // Сбрасываем флаг навигации
        setTimeout(() => {
            window.isNavigating = false;
        }, 400);
    }, 10);
    
    // Добавляем обработчик для кнопки "Назад"
    const backButton = document.querySelector('.back-to-category-btn');
    if (backButton) {
        // Очищаем существующие обработчики
        const newBackButton = backButton.cloneNode(true);
        backButton.parentNode.replaceChild(newBackButton, backButton);
        
        // Добавляем новый обработчик
        newBackButton.onclick = (e) => {
            // Предотвращаем стандартное поведение
            e.preventDefault();
            e.stopPropagation();
            
            // Проверяем, не находимся ли мы в процессе навигации
            if (window.isNavigating) return;
            
            // Устанавливаем флаг навигации
            window.isNavigating = true;
            
            // Закрываем полноэкранную страницу
            closeFullscreenPage();
            
            // Восстанавливаем хеш к категории
            const categoryPageMatch = categoryPage.id.match(/(.+)-page/);
            if (categoryPageMatch && categoryPageMatch[1]) {
                history.pushState(
                    { type: 'category', category: categoryPageMatch[1] },
                    '',
                    `#category/${categoryPageMatch[1]}`
                );
                
                // Обрабатываем текущий URL после задержки
                setTimeout(() => {
                    processCurrentUrl();
                    
                    // Сбрасываем флаг навигации
                    setTimeout(() => {
                        window.isNavigating = false;
                    }, 100);
                }, 500);
            } else {
                // Сбрасываем флаг навигации
                setTimeout(() => {
                    window.isNavigating = false;
                }, 500);
            }
        };
    }
    
    // Добавляем обработчик для клавиши Escape
    document.addEventListener('keydown', handleEscapeKeyForPage);
}

/**
 * Закрывает полноэкранную страницу
 */
function closeFullscreenPage(updateHistory = true) {
    const pageContainer = document.getElementById('fullscreen-page-container');
    
    if (!pageContainer || !pageContainer.classList.contains('active')) {
        if (window.isNavigating) {
            setTimeout(() => {
                window.isNavigating = false;
            }, 100);
        }
        return;
    }
    
    // Устанавливаем флаг навигации
    window.isNavigating = true;
    
    // Анимируем закрытие
    pageContainer.classList.remove('active');
    
    // После завершения анимации
    setTimeout(() => {
        // Полностью скрываем страницу
        pageContainer.style.display = 'none';
        
        // Разблокируем прокрутку
        document.querySelector('.main-content').style.overflow = '';
        
        // Восстанавливаем позицию прокрутки
        if (window.fullscreenPageScrollPos !== undefined) {
            window.scrollTo(0, window.fullscreenPageScrollPos);
        }
        
        // Обновляем URL если нужно
        if (updateHistory) {
            const hash = window.location.hash;
            if (hash.startsWith('#item/')) {
                const parts = hash.split('/');
                if (parts.length >= 2) {
                    // Переходим к категории
                    history.pushState(
                        { type: 'category', category: parts[1] },
                        '',
                        `#category/${parts[1]}`
                    );
                }
            }
        }
        
        // Убеждаемся, что все элементы видимы
        resetVisibilityOfExpandableItems();
        
        // Сбрасываем флаг навигации
        setTimeout(() => {
            window.isNavigating = false;
        }, 100);
    }, 350);
    
    // Удаляем обработчик Escape
    document.removeEventListener('keydown', handleEscapeKeyForPage);
}

/**
 * Восстанавливает видимость элементов сетки
 */
function resetVisibilityOfExpandableItems() {
    // Находим все страницы категорий
    const categoryPages = document.querySelectorAll('.category-page');
    
    categoryPages.forEach(page => {
        if (page.style.display === 'block') {
            // Предотвращаем перестроение сетки
            const grid = page.querySelector('.expandable-grid');
            if (grid) {
                // Сохраняем текущую высоту сетки
                const currentHeight = grid.offsetHeight;
                grid.style.minHeight = currentHeight + 'px';
            }
            
            // Настраиваем видимость элементов
            const gridItems = page.querySelectorAll('.expandable-item');
            gridItems.forEach(item => {
                item.style.position = 'relative';
                item.style.zIndex = '5';
                item.style.opacity = '1';
                item.style.visibility = 'visible';
                
                // Показываем превью
                const preview = item.querySelector('.item-preview');
                if (preview) {
                    preview.style.display = 'flex';
                    preview.style.opacity = '1';
                    preview.style.visibility = 'visible';
                    
                    // Показываем изображение
                    const image = preview.querySelector('.item-image');
                    if (image) {
                        image.style.display = 'block';
                        image.style.opacity = '1';
                        image.style.height = '120px';
                        image.style.maxHeight = '120px';
                        image.style.visibility = 'visible';
                    }
                    
                    // Показываем детали
                    const details = preview.querySelector('.item-details');
                    if (details) {
                        details.style.display = 'block';
                        details.style.opacity = '1';
                        details.style.visibility = 'visible';
                    }
                }
                
                // Удаляем временные стили для перехода
                setTimeout(() => {
                    item.style.position = '';
                    item.style.zIndex = '';
                }, 50);
            });
            
            // Восстанавливаем нормальное поведение сетки
            setTimeout(() => {
                if (grid) {
                    grid.style.minHeight = '';
                }
            }, 300);
        }
    });
}

/**
 * Обработчик клавиши Escape для закрытия страницы
 */
function handleEscapeKeyForPage(event) {
    if (event.key === 'Escape') {
        // Проверяем, не находимся ли мы в процессе навигации
        if (window.isNavigating) return;
        
        // Устанавливаем флаг навигации
        window.isNavigating = true;
        
        // Предотвращаем стандартное поведение
        event.preventDefault();
        
        // Закрываем страницу
        closeFullscreenPage();
        
        // Обновляем URL на категорию
        const hash = window.location.hash;
        if (hash.startsWith('#item/')) {
            const parts = hash.split('/');
            if (parts.length >= 2) {
                history.pushState(
                    { type: 'category', category: parts[1] },
                    '',
                    `#category/${parts[1]}`
                );
                
                // Обрабатываем текущий URL
                setTimeout(() => {
                    processCurrentUrl();
                    
                    // Сбрасываем флаг навигации
                    setTimeout(() => {
                        window.isNavigating = false;
                    }, 100);
                }, 500);
            } else {
                // Сбрасываем флаг навигации
                setTimeout(() => {
                    window.isNavigating = false;
                }, 500);
            }
        }
    }
}

/**
 * Навигация между страницами
 */
function navigateTo(hash, pageName, categoryName = null) {
    // Если мы уже в процессе навигации, пропускаем
    if (window.isNavigating) return;
    
    // Устанавливаем флаг навигации
    window.isNavigating = true;
    
    // Находим текущую активную страницу
    const homePage = document.querySelector('.home-page');
    const feedPage = document.querySelector('.feed-page');
    const currentCategoryPage = document.querySelector('.category-page[style*="display: block"]');
    
    // Определяем, откуда мы переходим
    let fromPage = null;
    if (homePage.style.display === 'block' || homePage.style.display === '') {
        fromPage = homePage;
    } else if (feedPage.style.display === 'block') {
        fromPage = feedPage;
    } else if (currentCategoryPage) {
        fromPage = currentCategoryPage;
    }
    
    // Анимируем исчезновение текущей страницы
    if (fromPage) {
        if (fromPage === homePage || fromPage === feedPage) {
            fromPage.classList.remove('page-active');
        } else {
            fromPage.classList.remove('active-animation');
        }
        
        // Задержка для анимации исчезновения
        setTimeout(() => {
            // Обновляем URL
            history.pushState({ page: pageName, category: categoryName }, '', '#' + hash);
            
            // Обновляем UI
            showPage(pageName, categoryName);
            updatePageTitle(pageName, categoryName);
            
            // Для страницы категории загружаем элементы
            if (pageName === 'category') {
                setTimeout(() => {
                    loadCategory(categoryName);
                }, 50);
            }
            
            // Прокручиваем страницу вверх
            window.scrollTo(0, 0);
            
            // Сбрасываем флаг навигации
            setTimeout(() => {
                window.isNavigating = false;
            }, 200);
        }, 150);
    } else {
        // Если нет текущей страницы, просто показываем нужную
        
        // Обновляем URL
        history.pushState({ page: pageName, category: categoryName }, '', '#' + hash);
        
        // Обновляем UI
        showPage(pageName, categoryName);
        updatePageTitle(pageName, categoryName);
        
        // Для страницы категории загружаем элементы
        if (pageName === 'category') {
            setTimeout(() => {
                loadCategory(categoryName);
            }, 50);
        }
        
        // Прокручиваем страницу вверх
        window.scrollTo(0, 0);
        
        // Сбрасываем флаг навигации
        setTimeout(() => {
            window.isNavigating = false;
        }, 50);
    }
}

/**
 * Показывает нужную страницу
 */
function showPage(pageName, categoryName = null) {
    // Находим все страницы
    const homePage = document.querySelector('.home-page');
    const feedPage = document.querySelector('.feed-page');

    // Удаляем классы анимации
    homePage.classList.remove('page-active');
    feedPage.classList.remove('page-active');

    // Закрываем полноэкранную страницу, если она открыта
    const fullscreenPage = document.getElementById('fullscreen-page-container');
    if (fullscreenPage && fullscreenPage.classList.contains('active') &&
        !window.location.hash.startsWith('#item/')) {
        closeFullscreenPage(false);
    }

    // Скрываем все страницы категорий
    const categoryPages = document.querySelectorAll('.category-page');
    categoryPages.forEach(page => {
        page.classList.remove('active-animation');
        page.style.display = 'none';
    });

    // Удаляем класс active у всех элементов меню
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
    });

    // Показываем нужную страницу
    if (pageName === 'home') {
        homePage.style.display = 'block';
        feedPage.style.display = 'none';

        document.querySelector('.nav-item[data-page="home"]').classList.add('active');

        // Анимация появления
        setTimeout(() => {
            homePage.classList.add('page-active');
        }, 20);

        setupImageViewers();

    } else if (pageName === 'feed') {
        homePage.style.display = 'none';
        feedPage.style.display = 'block';

        document.querySelector('.nav-item[data-page="feed"]').classList.add('active');

        // Анимация появления
        setTimeout(() => {
            feedPage.classList.add('page-active');
        }, 20);

    } else if (pageName === 'category' && categoryName) {
        homePage.style.display = 'none';
        feedPage.style.display = 'none';

        const categoryPageId = categoryName + '-page';
        const categoryPage = document.getElementById(categoryPageId);

        if (categoryPage) {
            // Сбрасываем состояние элементов сетки
            resetGridItems(categoryPage);
            
            // Показываем страницу категории
            categoryPage.style.display = 'block';
            
            // Анимация появления
            setTimeout(() => {
                categoryPage.classList.add('active-animation');
            }, 10);

            document.querySelector('.nav-item[data-page="feed"]').classList.add('active');

        } else {
            console.error('Страница категории не найдена:', categoryPageId);
            // Показываем запасную страницу
            const fallbackPage = document.getElementById('coding-page');
            if (fallbackPage) {
                fallbackPage.style.display = 'block';
                
                setTimeout(() => {
                    fallbackPage.classList.add('active-animation');
                }, 20);
                
                document.querySelector('.nav-item[data-page="feed"]').classList.add('active');
            }
        }
    }
}

/**
 * Сбрасывает состояние элементов сетки
 */
function resetGridItems(categoryPage) {
    const gridItems = categoryPage.querySelectorAll('.grid-item');
    gridItems.forEach(item => {
        item.removeAttribute('style');
        item.classList.remove('expanded');
        item.classList.remove('animating');

        const preview = item.querySelector('.item-preview');
        if (preview) {
            preview.style.display = 'flex';
            preview.style.opacity = '1';

            const image = preview.querySelector('.item-image');
            if (image) {
                image.style.display = 'block';
                image.style.opacity = '1';
                image.style.height = '120px';
                image.style.maxHeight = '120px';
            }

            const details = preview.querySelector('.item-details');
            if (details) {
                details.style.display = 'block';
                details.style.opacity = '1';
            }
        }

        const expandedContent = item.querySelector('.item-expanded-content');
        if (expandedContent) {
            expandedContent.style.display = 'none';
            expandedContent.style.opacity = '0';
            expandedContent.style.transform = 'scale(0.95)';
        }
    });

    const grid = categoryPage.querySelector('.expandable-grid');
    if (grid) {
        grid.style.height = '';
    }
}
/**
 * Инициализирует мобильную навигацию
 */
function initMobileNavigation() {
    // Получаем элементы мобильной навигации
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    
    // Если мобильная навигация не найдена, прекращаем выполнение
    if (!mobileNavItems.length) return;
    
    // Добавляем обработчики событий для элементов мобильной навигации
    mobileNavItems.forEach(item => {
        item.addEventListener('click', function() {
            // Удаляем класс active у всех элементов
            mobileNavItems.forEach(navItem => {
                navItem.classList.remove('active');
            });
            
            // Добавляем класс active текущему элементу
            this.classList.add('active');
            
            // Получаем имя страницы из атрибута data-page
            const pageName = this.getAttribute('data-page');
            
            // Навигация на соответствующую страницу
            if (pageName === 'home') {
                navigateTo('main', 'home');
            } else if (pageName === 'feed') {
                navigateTo('list', 'feed');
            } else if (pageName === 'search') {
                // Здесь можно добавить функционал поиска
                console.log('Поиск не реализован');
            } else if (pageName === 'profile') {
                // Здесь можно добавить функционал профиля
                console.log('Профиль не реализован');
            }
        });
    });
    
    // Функция для обновления активного элемента мобильной навигации
    function updateMobileNavigation(pageName) {
        mobileNavItems.forEach(item => {
            const itemPage = item.getAttribute('data-page');
            
            if (itemPage === pageName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    // Переопределяем функцию showPage для обновления мобильной навигации
    const originalShowPage = window.showPage || function() {};
    
    window.showPage = function(pageName, categoryName) {
        // Вызываем оригинальную функцию
        originalShowPage(pageName, categoryName);
        
        // Обновляем мобильную навигацию
        if (pageName === 'home') {
            updateMobileNavigation('home');
        } else if (pageName === 'feed' || pageName === 'category') {
            updateMobileNavigation('feed');
        }
    };
    
    // Вызываем processCurrentUrl для инициализации
    setTimeout(function() {
        const hash = window.location.hash;
        
        if (!hash || hash === '#' || hash === '#main') {
            updateMobileNavigation('home');
        } else if (hash === '#list' || hash.startsWith('#category/') || hash.startsWith('#item/')) {
            updateMobileNavigation('feed');
        }
    }, 100);
}

// Вызываем функцию после загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем инициализацию мобильной навигации
    initMobileNavigation();
});


// Добавьте этот код в ваш файл script.js

/**
 * Язык по умолчанию и доступные языки
 */
const LANGUAGES = {
    RU: {
        code: 'ru',
        label: 'Рус',
        translations: {
            // Навигация
            'nav_home': 'Главная',
            'nav_feed': 'Лента',
            'nav_search': 'Поиск',
            'nav_profile': 'Профиль',
            
            // Категории
            'category_coding': 'Кодинг',
            'category_programs': 'Программы',
            'category_settings': 'Settings',
            'category_music': 'Music',
            'category_gamesettings': 'Игровые настройки',
            'category_wallpaper': 'Обои',
            'category_trash': 'Trash',
            
            // Заголовки страниц
            'home_title': 'Видео + плеер',
            'feed_title': 'Патч-ноут',
            'categories_title': 'Мои категории',
            
            // Общие элементы
            'back_button': '🠔',
            'back_to_category': '🠔 Назад',
            
            // Другие элементы интерфейса
            'copy_button': 'Копировать',
            'copied_message': 'Скопировано!',
        }
    },
    UK: {
        code: 'uk',
        label: 'Укр',
        translations: {
            // Навигация
            'nav_home': 'Головна',
            'nav_feed': 'Стрічка',
            'nav_search': 'Пошук',
            'nav_profile': 'Профіль',
            
            // Категории
            'category_coding': 'Кодинг',
            'category_programs': 'Програми',
            'category_settings': 'Налаштування',
            'category_music': 'Музика',
            'category_gamesettings': 'Ігрові налаштування',
            'category_wallpaper': 'Шпалери',
            'category_trash': 'Кошик',
            
            // Заголовки страниц
            'home_title': 'Відео + плеєр',
            'feed_title': 'Патч-ноут',
            'categories_title': 'Мої категорії',
            
            // Общие элементы
            'back_button': '🠔',
            'back_to_category': '🠔 Назад',
            
            // Другие элементы интерфейса
            'copy_button': 'Копіювати',
            'copied_message': 'Скопійовано!',
        }
    },
    EN: {
        code: 'en',
        label: 'Eng',
        translations: {
            // Навигация
            'nav_home': 'Home',
            'nav_feed': 'Feed',
            'nav_search': 'Search',
            'nav_profile': 'Profile',
            
            // Категории
            'category_coding': 'Coding',
            'category_programs': 'Programs',
            'category_settings': 'Settings',
            'category_music': 'Music',
            'category_gamesettings': 'Game Settings',
            'category_wallpaper': 'Wallpapers',
            'category_trash': 'Trash',
            
            // Заголовки страниц
            'home_title': 'Video + Player',
            'feed_title': 'Patch Notes',
            'categories_title': 'My Categories',
            
            // Общие элементы
            'back_button': '🠔',
            'back_to_category': '🠔 Back',
            
            // Другие элементы интерфейса
            'copy_button': 'Copy',
            'copied_message': 'Copied!',
        }
    }
};

/**
 * Инициализирует переключатель языков
 */
function initLanguageSwitcher() {
    // Получаем кнопку переключения языка
    const languageBtn = document.getElementById('language-toggle');
    
    if (!languageBtn) {
        console.error('Кнопка переключения языка не найдена');
        return;
    }
    
    // Пытаемся загрузить сохраненный язык из localStorage
    let currentLang = localStorage.getItem('language') || 'RU';
    
    // Обновляем текст кнопки
    languageBtn.textContent = LANGUAGES[currentLang].label;
    
    // Применяем текущий язык
    applyLanguage(currentLang);
    
    // Добавляем обработчик события клика
    languageBtn.addEventListener('click', function() {
        // Переключаем язык
        switch (currentLang) {
            case 'RU':
                currentLang = 'UK';
                break;
            case 'UK':
                currentLang = 'EN';
                break;
            case 'EN':
                currentLang = 'RU';
                break;
            default:
                currentLang = 'RU';
        }
        
        // Обновляем текст кнопки
        languageBtn.textContent = LANGUAGES[currentLang].label;
        
        // Сохраняем выбранный язык в localStorage
        localStorage.setItem('language', currentLang);
        
        // Применяем новый язык
        applyLanguage(currentLang);
    });
}

/**
 * Применяет выбранный язык к элементам страницы
 */
function applyLanguage(lang) {
    const translations = LANGUAGES[lang].translations;
    
    // Обновляем текст навигационных элементов
    updateNavElements(translations);
    
    // Обновляем текст категорий
    updateCategoryElements(translations);
    
    // Обновляем другие элементы интерфейса
    updateUIElements(translations);
}

/**
 * Обновляет текст навигационных элементов
 */
function updateNavElements(translations) {
    // Обновляем основное меню
    document.querySelectorAll('.nav-item').forEach(item => {
        const pageName = item.getAttribute('data-page');
        const navText = item.querySelector('.nav-text');
        
        if (navText) {
            if (pageName === 'home') {
                navText.textContent = translations['nav_home'];
            } else if (pageName === 'feed') {
                navText.textContent = translations['nav_feed'];
            }
        }
    });
    
    // Обновляем мобильную навигацию
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
        const pageName = item.getAttribute('data-page');
        const navText = item.querySelector('.mobile-nav-text');
        
        if (navText) {
            if (pageName === 'home') {
                navText.textContent = translations['nav_home'];
            } else if (pageName === 'feed') {
                navText.textContent = translations['nav_feed'];
            } else if (pageName === 'search') {
                navText.textContent = translations['nav_search'];
            } else if (pageName === 'profile') {
                navText.textContent = translations['nav_profile'];
            }
        }
    });
}

/**
 * Обновляет текст элементов категорий
 */
function updateCategoryElements(translations) {
    // Обновляем названия категорий
    document.querySelectorAll('.category-item').forEach(item => {
        const categoryName = item.getAttribute('data-category');
        const categoryTitle = item.querySelector('.category-name');
        
        if (categoryTitle && categoryName) {
            const translationKey = 'category_' + categoryName;
            if (translations[translationKey]) {
                categoryTitle.textContent = translations[translationKey];
            }
        }
    });
    
    // Обновляем заголовки страниц категорий
    document.querySelectorAll('.category-page').forEach(page => {
        const categoryTitle = page.querySelector('.category-title');
        const pageId = page.id;
        
        if (categoryTitle && pageId) {
            const categoryName = pageId.replace('-page', '');
            const translationKey = 'category_' + categoryName;
            
            if (translations[translationKey]) {
                categoryTitle.textContent = translations[translationKey];
            }
        }
        
        // Обновляем кнопку "назад"
        const backButton = page.querySelector('.back-button h3');
        if (backButton) {
            backButton.textContent = translations['back_button'];
        }
    });
}

/**
 * Обновляет текст прочих элементов интерфейса
 */
function updateUIElements(translations) {
    // Обновляем кнопки копирования кода
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.textContent = translations['copy_button'];
        
        // Сохраняем сообщение о копировании в атрибуте
        btn.setAttribute('data-copied-text', translations['copied_message']);
    });
    
    // Обновляем кнопку возврата к категории в полноэкранном режиме
    const backToCategoryBtn = document.querySelector('.back-to-category-btn h3');
    if (backToCategoryBtn) {
        backToCategoryBtn.textContent = translations['back_to_category'];
    }
}

// Модифицируем функцию для копирования кода
function setupCodeCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(button => {
        // Удаляем существующие обработчики
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Добавляем новый обработчик
        newButton.addEventListener('click', function() {
            const codeBlock = this.closest('.code-container').querySelector('pre code');
            const text = codeBlock.textContent;
            
            navigator.clipboard.writeText(text).then(() => {
                const originalText = this.textContent;
                
                // Используем перевод из атрибута данных
                const copiedText = this.getAttribute('data-copied-text') || 'Скопировано!';
                this.textContent = copiedText;
                
                setTimeout(() => {
                    this.textContent = originalText;
                }, 2000);
            }).catch(err => {
                console.error('Ошибка копирования: ', err);
            });
        });
    });
}

// Вызываем функцию после загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем переключатель языков
    initLanguageSwitcher();
});