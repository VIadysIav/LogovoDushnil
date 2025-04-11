// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Флаг для отслеживания, находимся ли мы в процессе навигации
    window.isNavigating = false;
    
    // Создание модального окна для просмотра изображений
    createImageModal();
    
    // Добавляем обработчики для просмотра изображений
    setupImageViewers();
    
    // Загружаем сохраненную тему
    loadSavedTheme();
    
    // Инициализируем обработчики событий
    setupEventHandlers();
    
    // Инициализируем систему полноэкранных страниц
    initFullscreenPageSystem();
    
    // Инициализируем все сетки на странице
    setupExpandableGrid('.expandable-grid');
    
// Добавляем обработчик события popstate (срабатывает при нажатии кнопки "назад" браузера)
window.addEventListener('popstate', function(event) {
    // Если мы уже в процессе навигации, пропускаем этот вызов
    if (window.isNavigating) return;
    
    // Устанавливаем флаг навигации
    window.isNavigating = true;
    
    // Проверяем, открыта ли полноэкранная страница
    const fullscreenPage = document.querySelector('.fullscreen-page-container.active');
    if (fullscreenPage) {
        // Закрываем полноэкранную страницу без обновления истории
        closeFullscreenPage(false);
        
        // После закрытия полноэкранной страницы обрабатываем текущий URL
        setTimeout(() => {
            // Проверяем URL после закрытия полноэкранной страницы
            processCurrentUrl();
            
            // Сбрасываем флаг навигации через задержку
            setTimeout(() => {
                window.isNavigating = false;
            }, 100);
        }, 250);
    } else {
        // Находим текущую открытую страницу категории, если такая есть
        const currentCategoryPage = document.querySelector('.category-page[style*="display: block"]');
        
        // Проверяем, переходим ли мы от категории к списку категорий
        if (currentCategoryPage && window.location.hash === '#list') {
            // Применяем анимацию закрытия страницы категории
            currentCategoryPage.classList.remove('active-animation');
            
            // Обрабатываем текущий URL после задержки для анимации
            setTimeout(() => {
                processCurrentUrl();
                
                // Сбрасываем флаг навигации
                setTimeout(() => {
                    window.isNavigating = false;
                }, 50);
            }, 150);
        } else {
            // Просто обрабатываем текущий URL для других случаев
            processCurrentUrl();
            
            // Сбрасываем флаг навигации
            setTimeout(() => {
                window.isNavigating = false;
            }, 100);
        }
    }
});
    
    // Проверяем URL при загрузке страницы
    processCurrentUrl();
});

// Функция для обработки текущего URL и навигации
function processCurrentUrl() {
    // Получаем хеш из URL
    const hash = window.location.hash;
    
    // Определяем, какую страницу показать на основе хеша
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
        
        // После того как мы определили и загрузили страницу категории,
        // инициализируем все сетки на активной странице
        setTimeout(() => {
            const activePage = document.getElementById(categoryName + '-page');
            if (activePage) {
                const grids = activePage.querySelectorAll('.expandable-grid');
                grids.forEach(grid => {
                    setupExpandableGrid(grid);
                });
            }
        }, 200);
    }
}

// Функция для загрузки категории и возможного открытия элемента
function loadCategory(categoryName, itemId = null) {
    // Находим страницу категории
    const categoryPage = document.getElementById(categoryName + '-page');
    if (!categoryPage) return;
    
    // Находим сетку элементов
    const expandableGrid = categoryPage.querySelector('.expandable-grid');
    if (!expandableGrid) return;
    
    // Сбрасываем все ранее открытые расширенные элементы
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
    
    // Восстанавливаем правильное отображение всех элементов сетки
    const gridItems = expandableGrid.querySelectorAll('.expandable-item');
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
    
    // Обнуляем глобальные переменные состояния
    if (typeof expandedItem !== 'undefined') {
        expandedItem = null;
    }
    
    if (typeof isAnimating !== 'undefined') {
        isAnimating = false;
    }
    
    // Инициализируем сетку для конкретной категории
    setupExpandableGrid(expandableGrid);
    
    // Если указан ID элемента, открываем его
    if (itemId) {
        // Небольшая задержка, чтобы страница категории успела загрузиться
        setTimeout(() => {
            const itemToOpen = expandableGrid.querySelector(`.expandable-item[data-category="${itemId}"]`);
            if (itemToOpen) {
                openFullscreenPage(itemToOpen, false);
            }
        }, 200);
    }
}

// Функция для обновления заголовка страницы
function updatePageTitle(pageName = 'home', categoryName = null) {
    // Устанавливаем только название сайта без дополнительных префиксов
    document.title = 'LogovoDushnil';
}

// Функция для создания модального окна
function createImageModal() {
    // Проверяем, существует ли уже модальное окно
    if (document.querySelector('.image-modal')) {
        return;
    }
    
    // Создаем элемент модального окна
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    
    // Создаем контент модального окна
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Создаем крестик для закрытия
    const closeButton = document.createElement('span');
    closeButton.className = 'close-modal';
    closeButton.innerHTML = '&times;';
    
    // Создаем элемент изображения
    const modalImage = document.createElement('img');
    
    // Добавляем все элементы в модальное окно
    modalContent.appendChild(modalImage);
    modal.appendChild(closeButton);
    modal.appendChild(modalContent);
    
    // Добавляем модальное окно в документ
    document.body.appendChild(modal);
    
    // Закрываем модальное окно при клике на крестик
    closeButton.onclick = function() {
        closeModal(modal, modalContent, closeButton);
    };
    
    // Закрываем модальное окно при клике вне изображения
    modal.onclick = function(event) {
        if (event.target === modal) {
            closeModal(modal, modalContent, closeButton);
        }
    };
    
    // Закрываем модальное окно при нажатии Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.classList.contains('show')) {
            closeModal(modal, modalContent, closeButton);
        }
    });
}

// Функция для закрытия модального окна с анимацией
function closeModal(modal, modalContent, closeButton) {
    // Плавно скрываем элементы
    modalContent.classList.remove('show');
    closeButton.classList.remove('show');
    
    // Через 300мс (длительность анимации) скрываем полностью модальное окно
    setTimeout(function() {
        modal.classList.remove('show');
        
        // Еще через 300мс переключаем display на none
        setTimeout(function() {
            modal.style.display = 'none';
        }, 300);
    }, 300);
}

// Функция для установки обработчиков просмотра изображений
function setupImageViewers() {
    const images = document.querySelectorAll('.post-image');
    const modal = document.querySelector('.image-modal');
    
    if (!modal) return;
    
    const modalContent = document.querySelector('.modal-content');
    const closeButton = document.querySelector('.close-modal');
    const modalImg = document.querySelector('.modal-content img');
    
    images.forEach(img => {
        img.onclick = function() {
            // Показываем модальное окно и устанавливаем изображение
            modal.style.display = 'flex';
            modalImg.src = this.src;
            
            // Запускаем рендеринг браузера, чтобы CSS анимации работали корректно
            setTimeout(function() {
                // Добавляем классы для плавного появления
                modal.classList.add('show');
                
                // Через 10мс показываем содержимое (для более плавной анимации)
                setTimeout(function() {
                    modalContent.classList.add('show');
                    closeButton.classList.add('show');
                }, 10);
            }, 10);
        };
    });
}

// Функция для установки всех обработчиков событий
function setupEventHandlers() {
    // Переключение на главную страницу при клике на логотип
    const homeLink = document.getElementById('home-link');
    if (homeLink) {
        homeLink.addEventListener('click', function(e) {
            e.preventDefault();
            navigateTo('main', 'home');
        });
    }
    
// Переключение между страницами в меню - с проверкой на активную страницу
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Проверяем, не является ли эта страница уже активной
        if (this.classList.contains('active')) {
            // Если страница уже активна, не выполняем никаких действий
            return;
        }
        
        // Получаем имя страницы, которую нужно показать
        const pageName = this.getAttribute('data-page');
        
        if (pageName === 'home') {
            navigateTo('main', 'home');
        } else if (pageName === 'feed') {
            navigateTo('list', 'feed');
        }
    });
});
    
    // Переключение на контент категории при клике на категорию
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const categoryName = this.getAttribute('data-category');
            navigateTo('category/' + categoryName, 'category', categoryName);
        });
    });
    
// Обновленная версия обработчика для кнопки "назад" - еще быстрее
document.querySelectorAll('.back-button').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Перед возвратом к списку категорий, проверяем, есть ли расширенный элемент
        const currentCategoryPage = button.closest('.category-page');
        if (currentCategoryPage) {
            // Применяем анимацию закрытия страницы категории
            currentCategoryPage.classList.remove('active-animation');
            
            // Задержка перед скрытием страницы и переходом в ленту - еще быстрее
            setTimeout(() => {
                const expandableGrid = currentCategoryPage.querySelector('.expandable-grid');
                if (expandableGrid) {
                    // Находим все расширенные элементы и сбрасываем их состояние
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
                    
                    // ВАЖНОЕ ИСПРАВЛЕНИЕ: Полностью восстанавливаем видимость всех элементов
                    const gridItems = expandableGrid.querySelectorAll('.expandable-item');
                    gridItems.forEach(item => {
                        // Удаляем все встроенные стили
                        item.removeAttribute('style');
                        
                        // Принудительно показываем превью
                        const preview = item.querySelector('.item-preview');
                        if (preview) {
                            preview.style.display = 'flex';
                            preview.style.opacity = '1';
                        }
                        
                        // Восстанавливаем изображение
                        const image = item.querySelector('.item-image');
                        if (image) {
                            image.style.display = 'block';
                            image.style.opacity = '1';
                            image.style.height = '120px';
                            image.style.maxHeight = '120px';
                        }
                        
                        // Восстанавливаем детали
                        const details = item.querySelector('.item-details');
                        if (details) {
                            details.style.display = 'block';
                            details.style.opacity = '1';
                        }
                    });
                    
                    // Устанавливаем глобальную переменную expandedItem в null
                    if (typeof expandedItem !== 'undefined') {
                        expandedItem = null;
                    }
                    
                    // Устанавливаем флаг isAnimating в false
                    if (typeof isAnimating !== 'undefined') {
                        isAnimating = false;
                    }
                }
                
                // Переходим к списку категорий после завершения анимации
                navigateTo('list', 'feed');
            }, 150); // Время должно соответствовать длительности анимации в CSS
        } else {
            // Сразу переходим к списку категорий, если не нашли страницу категории
            navigateTo('list', 'feed');
        }
    });
});
        
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
    
    // Добавляем обработчики для копирования кода на всех страницах
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', function() {
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

// Функция для навигации между страницами с ускоренной анимацией
function navigateTo(hash, pageName, categoryName = null) {
    // Если мы уже в процессе навигации, пропускаем
    if (window.isNavigating) return;
    
    // Устанавливаем флаг, что мы в процессе навигации
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
        
        // Добавляем задержку для анимации исчезновения - УСКОРЕННУЮ
        setTimeout(() => {
            // Обновляем URL, используя history API
            history.pushState({ page: pageName, category: categoryName }, '', '#' + hash);
            
            // Обновляем UI
            showPage(pageName, categoryName);
            updatePageTitle(pageName, categoryName);
            
            // Для страницы категории дополнительно загружаем элементы
            if (pageName === 'category') {
                setTimeout(() => {
                    loadCategory(categoryName);
                }, 50); // Было 100, теперь 50 мс
            }
            
            // Прокручиваем страницу вверх
            window.scrollTo(0, 0);
            
            // Сбрасываем флаг навигации после небольшой задержки
            setTimeout(() => {
                window.isNavigating = false;
            }, 200); // Было 400, теперь 200 мс
        }, 150); // Было 300, теперь 150 мс
    } else {
        // Если нет текущей страницы (например, при первой загрузке),
        // просто показываем нужную страницу без анимации исчезновения
        
        // Обновляем URL, используя history API
        history.pushState({ page: pageName, category: categoryName }, '', '#' + hash);
        
        // Обновляем UI
        showPage(pageName, categoryName);
        updatePageTitle(pageName, categoryName);
        
        // Для страницы категории дополнительно загружаем элементы
        if (pageName === 'category') {
            setTimeout(() => {
                loadCategory(categoryName);
            }, 50); // Было 100, теперь 50 мс
        }
        
        // Прокручиваем страницу вверх
        window.scrollTo(0, 0);
        
        // Сбрасываем флаг навигации после небольшой задержки
        setTimeout(() => {
            window.isNavigating = false;
        }, 50); // Было 100, теперь 50 мс
    }
}
// Функция для показа нужной страницы с ускоренной анимацией
function showPage(pageName, categoryName = null) {
    // Находим все страницы
    const homePage = document.querySelector('.home-page');
    const feedPage = document.querySelector('.feed-page');

    // Удаляем классы анимации со всех страниц
    homePage.classList.remove('page-active');
    feedPage.classList.remove('page-active');

    // Закрываем полноэкранную страницу, если она открыта и мы не переходим к элементу
    const fullscreenPage = document.getElementById('fullscreen-page-container');
    if (fullscreenPage && fullscreenPage.classList.contains('active') &&
        !window.location.hash.startsWith('#item/')) {
        closeFullscreenPage(false); // false означает не обновлять историю
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

    // Показываем нужную страницу и активируем соответствующий пункт меню
    if (pageName === 'home') {
        homePage.style.display = 'block';
        feedPage.style.display = 'none';

        document.querySelector('.nav-item[data-page="home"]').classList.add('active');

        // Ускоренная анимация появления главной страницы
        setTimeout(() => {
            homePage.classList.add('page-active');
        }, 20); // Было 50, теперь 20 мс

        setupImageViewers();

    } else if (pageName === 'feed') {
        homePage.style.display = 'none';
        feedPage.style.display = 'block';

        document.querySelector('.nav-item[data-page="feed"]').classList.add('active');

        // Ускоренная анимация появления ленты
        setTimeout(() => {
            feedPage.classList.add('page-active');
        }, 20); // Было 50, теперь 20 мс

    } else if (pageName === 'category' && categoryName) {
        homePage.style.display = 'none';
        feedPage.style.display = 'none';

        const categoryPageId = categoryName + '-page';
        const categoryPage = document.getElementById(categoryPageId);

        if (categoryPage) {
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

            categoryPage.style.display = 'block';
            
            // Ускоренная анимация появления страницы категории
            setTimeout(() => {
                categoryPage.classList.add('active-animation');
            }, 10); // Было 20, теперь 10 мс

            document.querySelector('.nav-item[data-page="feed"]').classList.add('active');

        } else {
            console.error('Страница категории не найдена:', categoryPageId);
            const fallbackPage = document.getElementById('coding-page');
            fallbackPage.style.display = 'block';
            
            // Ускоренная анимация запасной страницы
            setTimeout(() => {
                fallbackPage.classList.add('active-animation');
            }, 20); // Было 50, теперь 20 мс
            
            document.querySelector('.nav-item[data-page="feed"]').classList.add('active');
        }
    }
}


// Функция загрузки сохраненной темы
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

// Функция для подготовки расширяемых карточек
function setupExpandableGrid(selector = '.expandable-grid') {
    // Находим все сетки, соответствующие селектору
    let grids;
    
    if (typeof selector === 'string') {
        grids = document.querySelectorAll(selector);
    } else {
        // Если передан DOM-элемент, а не селектор
        grids = [selector];
    }
    
    if (grids.length === 0) {
        console.error(`Не найдены сетки по селектору '${selector}'`);
        return;
    }
    
    // Обрабатываем каждую найденную сетку
    grids.forEach(grid => {
        const items = grid.querySelectorAll('.expandable-item');
        if (items.length === 0) {
            console.error("Не найдены элементы '.expandable-item'", grid);
            return;
        }
        
        // Предварительная подготовка всех элементов
        items.forEach(item => {
            const expandedContent = item.querySelector('.item-expanded-content');
            if (!expandedContent) {
                console.error("В элементе отсутствует '.item-expanded-content'", item);
                return;
            }
            
            // Принудительно устанавливаем правильные стили для скрытого состояния
            expandedContent.style.display = 'none';
            expandedContent.style.opacity = '0';
            expandedContent.style.transform = 'scale(0.95)';
            
            // Убедимся, что сами элементы не имеют лишних встроенных стилей
            item.removeAttribute('style');
            
            // Восстанавливаем видимость превью
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
        
        // Добавляем обработчики событий на все элементы сетки
        items.forEach(item => {
            // Проверяем наличие элемента превью
            const previewElement = item.querySelector('.item-preview');
            if (previewElement) {
                // Удаляем существующие обработчики
                const newPreviewElement = previewElement.cloneNode(true);
                previewElement.parentNode.replaceChild(newPreviewElement, previewElement);
                
                // Добавляем новый обработчик
                newPreviewElement.addEventListener('click', () => {
                    // Вместо раскрытия на месте вызываем функцию открытия полноэкранной страницы
                    openFullscreenPage(item);
                });
            } else {
                console.error("В элементе отсутствует '.item-preview'", item);
            }
        });
    });
}

// Функция для открытия полноэкранной страницы с учетом видимости левого меню
function openFullscreenPage(item, updateHistory = true) {
    // Проверяем, не находимся ли мы в процессе навигации
    if (window.isNavigating) return;
    
    // Устанавливаем флаг, что мы в процессе навигации
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
    
    // Клонируем содержимое, чтобы не удалять его из оригинального элемента
    const contentClone = expandedContent.cloneNode(true);
    
    // Очищаем и заполняем контейнер содержимым
    pageContent.innerHTML = '';
    pageContent.appendChild(contentClone);
    
    // Показываем клонированное содержимое
    contentClone.style.display = 'block';
    contentClone.style.opacity = '1';
    contentClone.style.transform = 'scale(1)';
    
    // Устанавливаем заголовок
    pageTitle.textContent = title;
    
    // Обновляем URL с информацией о текущем элементе
    if (updateHistory) {
        const categoryPageMatch = categoryPage.id.match(/(.+)-page/);
        if (categoryPageMatch && categoryPageMatch[1]) {
            const categoryUrlId = categoryPageMatch[1];
            // Изменяем хеш URL с использованием pushState для лучшего управления историей
            history.pushState(
                { type: 'item', category: categoryUrlId, item: categoryId },
                '',
                `#item/${categoryUrlId}/${categoryId}`
            );
        }
    }
    
    // Сохраняем текущее положение прокрутки для возврата
    window.fullscreenPageScrollPos = window.scrollY;
    // Отображаем полноэкранную страницу
    pageContainer.style.display = 'block';
    
    // Устанавливаем CSS-переход и добавляем класс active
    setTimeout(() => {
        pageContainer.classList.add('active');
        
        // Прокручиваем содержимое страницы в начало (не весь документ)
        pageContainer.scrollTop = 0;
        
        // Блокируем прокрутку основной страницы, но не левого меню
        document.querySelector('.main-content').style.overflow = 'hidden';
        
        // Сбрасываем флаг навигации после завершения анимации
        setTimeout(() => {
            window.isNavigating = false;
        }, 400);
    }, 10);
    
    // Добавляем обработчик для кнопки "Назад"
    const backButton = document.querySelector('.back-to-category-btn');
    if (backButton) {
        // Очищаем все предыдущие обработчики
        const newBackButton = backButton.cloneNode(true);
        backButton.parentNode.replaceChild(newBackButton, backButton);
        
        // Добавляем новый обработчик
        newBackButton.onclick = (e) => {
            // Предотвращаем стандартное поведение
            e.preventDefault();
            e.stopPropagation();
            
            // Проверяем, не находимся ли мы в процессе навигации
            if (window.isNavigating) return;
            
            // Устанавливаем флаг, что мы в процессе навигации
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
                
                // Через небольшую задержку восстанавливаем страницу категории
                setTimeout(() => {
                    // Обрабатываем текущий URL
                    processCurrentUrl();
                    
                    // Сбрасываем флаг навигации через дополнительную задержку
                    setTimeout(() => {
                        window.isNavigating = false;
                    }, 100);
                }, 500);
            } else {
                // Если категория не определена, просто сбрасываем флаг навигации
                setTimeout(() => {
                    window.isNavigating = false;
                }, 500);
            }
        };
    }
    
    // Настраиваем копирование кода в полноэкранном режиме
    setupCodeCopyButtons();
    
    // Добавляем обработчик для клавиши Escape
    document.addEventListener('keydown', handleEscapeKeyForPage);
}

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
    
    // Сохраняем состояние сетки перед началом закрытия
    preserveGridState();
    
    // Устанавливаем флаг навигации
    window.isNavigating = true;
    
    // Анимируем закрытие
    pageContainer.classList.remove('active');
    
    // После завершения анимации
    setTimeout(() => {
        // Полностью скрываем полноэкранную страницу
        pageContainer.style.display = 'none';
        
        // Разблокируем прокрутку
        document.querySelector('.main-content').style.overflow = '';
        
        // Восстанавливаем позицию прокрутки
        if (window.fullscreenPageScrollPos !== undefined) {
            window.scrollTo(0, window.fullscreenPageScrollPos);
        }
        
        // Важно! Восстанавливаем состояние сетки
        restoreGridState();
        
        // Обновляем URL если нужно
        if (updateHistory) {
            const hash = window.location.hash;
            if (hash.startsWith('#item/')) {
                const parts = hash.split('/');
                if (parts.length >= 2) {
                    // Используем pushState с текущей реализацией
                    history.pushState(
                        { type: 'category', category: parts[1] },
                        '',
                        `#category/${parts[1]}`
                    );
                }
            }
        }
        
        // Убеждаемся, что все элементы видимы
        const activeCategory = document.querySelector('.category-page[style*="display: block"]');
        if (activeCategory) {
            const gridItems = activeCategory.querySelectorAll('.expandable-item');
            gridItems.forEach(item => {
                item.style.opacity = '1';
                item.style.visibility = 'visible';
                
                const preview = item.querySelector('.item-preview');
                if (preview) {
                    preview.style.display = 'flex';
                    preview.style.opacity = '1';
                    preview.style.visibility = 'visible';
                    
                    const image = preview.querySelector('.item-image');
                    if (image) {
                        image.style.display = 'block';
                        image.style.opacity = '1';
                        image.style.height = '120px';
                        image.style.maxHeight = '120px';
                        image.style.visibility = 'visible';
                    }
                }
            });
        }
        
        // Сбрасываем флаг навигации
        setTimeout(() => {
            window.isNavigating = false;
        }, 100);
    }, 350);
    
    // Удаляем обработчик Escape
    document.removeEventListener('keydown', handleEscapeKeyForPage);
}

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
            
            // Находим элементы сетки и устанавливаем им высокий z-index,
            // чтобы они оставались видимыми во время перехода
            const gridItems = page.querySelectorAll('.expandable-item');
            gridItems.forEach(item => {
                item.style.position = 'relative';
                item.style.zIndex = '5';
                item.style.opacity = '1';
                item.style.visibility = 'visible';
                
                // Принудительно показываем превью
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
                
                // Через небольшую задержку удаляем все inline стили
                setTimeout(() => {
                    // Удаляем только временные стили для перехода
                    item.style.position = '';
                    item.style.zIndex = '';
                    
                    // НЕ удаляем стили видимости - они важны
                    // item.style.opacity = '';
                    // item.style.visibility = '';
                }, 50);
            });
            
            // Через задержку восстанавливаем нормальное поведение сетки
            setTimeout(() => {
                if (grid) {
                    grid.style.minHeight = '';
                }
            }, 300);
        }
    });
}

// Обработчик клавиши Escape для закрытия страницы
function handleEscapeKeyForPage(event) {
    if (event.key === 'Escape') {
        // Проверяем, не находимся ли мы в процессе навигации
        if (window.isNavigating) return;
        
        // Устанавливаем флаг, что мы в процессе навигации
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
                
                // Обрабатываем текущий URL через задержку
                setTimeout(() => {
                    processCurrentUrl();
                    
                    // Сбрасываем флаг навигации через дополнительную задержку
                    setTimeout(() => {
                        window.isNavigating = false;
                    }, 100);
                }, 500);
            } else {
                // Если категория не определена, просто сбрасываем флаг навигации
                setTimeout(() => {
                    window.isNavigating = false;
                }, 500);
            }
        }
    }
}

// Функция для инициализации полноэкранной страницы после загрузки DOM
function initFullscreenPageSystem() {
    // Проверяем наличие контейнера полноэкранной страницы
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
        backButton.innerHTML = '<b>🠔 Назад</b>'; // Используем HTML для жирного текста
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

// Функция для настройки кнопок копирования кода в полноэкранном режиме
function setupCodeCopyButtons() {
    // Находим все кнопки копирования кода на полноэкранной странице
    const buttons = document.querySelectorAll('.fullscreen-page-content .copy-btn');
    
    buttons.forEach(button => {
        // Удаляем существующие обработчики события
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Добавляем новый обработчик
        newButton.addEventListener('click', function() {
            // Находим блок кода для копирования
            const codeBlock = this.closest('.code-container').querySelector('pre code');
            if (!codeBlock) return;
            
            // Получаем текст кода
            const text = codeBlock.textContent;
            
            // Копируем в буфер обмена
            navigator.clipboard.writeText(text).then(() => {
                // Показываем подтверждение
                const originalText = this.textContent;
                this.textContent = 'Скопировано!';
                
                // Возвращаем исходный текст через 2 секунды
                setTimeout(() => {
                    this.textContent = originalText;
                }, 2000);
            }).catch(err => {
                console.error('Ошибка копирования: ', err);
            });
        });
    });
}
function preserveGridState() {
    // Находим активную страницу категории
    const activeCategory = document.querySelector('.category-page[style*="display: block"]');
    if (!activeCategory) return;
    
    // Находим сетку
    const grid = activeCategory.querySelector('.expandable-grid');
    if (!grid) return;
    
    // Сохраняем текущее состояние для каждого элемента
    const gridItems = grid.querySelectorAll('.expandable-item');
    gridItems.forEach((item, index) => {
        // Сохраняем текущие значения стилей
        const currentStyles = {
            opacity: item.style.opacity || '1',
            display: item.style.display || 'block',
            visibility: item.style.visibility || 'visible',
            position: window.getComputedStyle(item).position,
            zIndex: window.getComputedStyle(item).zIndex
        };
        
        // Сохраняем стили для превью
        const preview = item.querySelector('.item-preview');
        if (preview) {
            currentStyles.preview = {
                display: preview.style.display || 'flex',
                opacity: preview.style.opacity || '1',
                visibility: preview.style.visibility || 'visible'
            };
            
            // Сохраняем стили для изображения
            const image = preview.querySelector('.item-image');
            if (image) {
                currentStyles.image = {
                    display: image.style.display || 'block',
                    opacity: image.style.opacity || '1',
                    height: image.style.height || '120px',
                    maxHeight: image.style.maxHeight || '120px',
                    visibility: image.style.visibility || 'visible'
                };
            }
            
            // Сохраняем стили для деталей
            const details = preview.querySelector('.item-details');
            if (details) {
                currentStyles.details = {
                    display: details.style.display || 'block',
                    opacity: details.style.opacity || '1',
                    visibility: details.style.visibility || 'visible'
                };
            }
        }
        
        // Сохраняем состояние в атрибуте данных
        item.dataset.savedState = JSON.stringify(currentStyles);
        item.dataset.preserved = 'true';
    });
    
    return true;
}
function restoreGridState() {
    // Находим активную страницу категории
    const activeCategory = document.querySelector('.category-page[style*="display: block"]');
    if (!activeCategory) return;
    
    // Находим сетку
    const grid = activeCategory.querySelector('.expandable-grid');
    if (!grid) return;
    
    // Восстанавливаем состояние для каждого элемента
    const gridItems = grid.querySelectorAll('.expandable-item[data-preserved="true"]');
    gridItems.forEach((item) => {
        try {
            // Получаем сохраненные стили
            const savedState = JSON.parse(item.dataset.savedState || '{}');
            
            // Применяем сохраненные стили к элементу
            Object.keys(savedState).forEach(key => {
                if (key === 'preview' || key === 'image' || key === 'details') return;
                item.style[key] = savedState[key];
            });
            
            // Восстанавливаем стили для превью
            if (savedState.preview) {
                const preview = item.querySelector('.item-preview');
                if (preview) {
                    Object.keys(savedState.preview).forEach(key => {
                        preview.style[key] = savedState.preview[key];
                    });
                }
            }
            
            // Восстанавливаем стили для изображения
            if (savedState.image) {
                const preview = item.querySelector('.item-preview');
                if (preview) {
                    const image = preview.querySelector('.item-image');
                    if (image) {
                        Object.keys(savedState.image).forEach(key => {
                            image.style[key] = savedState.image[key];
                        });
                    }
                }
            }
            
            // Восстанавливаем стили для деталей
            if (savedState.details) {
                const preview = item.querySelector('.item-preview');
                if (preview) {
                    const details = preview.querySelector('.item-details');
                    if (details) {
                        Object.keys(savedState.details).forEach(key => {
                            details.style[key] = savedState.details[key];
                        });
                    }
                }
            }
            
            // Удаляем флаг сохранения
            delete item.dataset.savedState;
            delete item.dataset.preserved;
        } catch (e) {
            console.error('Ошибка при восстановлении состояния элемента:', e);
        }
    });
    
    return true;
}