// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем URL при загрузке страницы
    checkUrlAndNavigate();
    
    // Создание модального окна для просмотра изображений
    createImageModal();
    
    // Добавляем обработчики для просмотра изображений
    setupImageViewers();
    
    // Загружаем сохраненную тему
    loadSavedTheme();
    
    // Добавляем обработчик события hashchange (срабатывает при изменении хеша URL)
    window.addEventListener('hashchange', function() {
        checkUrlAndNavigate(false);
    });

    // Инициализируем обработчики событий
    setupEventHandlers();
});

// Функция для проверки URL и навигации к нужной странице
function checkUrlAndNavigate(pushState = true) {
    // Получаем хеш из URL
    const hash = window.location.hash;
    
    // Определяем, какую страницу показать на основе хеша
    let pageName = 'home';
    let categoryName = null;
    
    if (!hash || hash === '#' || hash === '#main') {
        pageName = 'home';
    } else if (hash === '#list') {
        pageName = 'feed';
    } else if (hash.startsWith('#category/')) {
        pageName = 'category';
        // Извлекаем имя категории из URL
        categoryName = hash.split('/')[1];
    }
    
    // Показываем нужную страницу
    showPage(pageName, categoryName);
    
    // Обновляем заголовок страницы
    updatePageTitle(pageName, categoryName);
    
    // Инициализируем расширяемую сетку, если мы на странице категории
    if (pageName === 'category') {
        // Запускаем инициализацию с небольшой задержкой, чтобы DOM успел обновиться
        setTimeout(() => {
            // Сбрасываем все ранее открытые расширенные элементы
            const categoryPage = document.getElementById(categoryName + '-page');
            if (categoryPage) {
                const expandableGrid = categoryPage.querySelector('.expandable-grid');
                if (expandableGrid) {
                    const expandedItems = expandableGrid.querySelectorAll('.expandable-item.expanded');
                    expandedItems.forEach(item => {
                        item.classList.remove('expanded');
                        item.classList.remove('animating');
                        
                        // Скрываем расширенное содержимое
                        const expandedContent = item.querySelector('.item-expanded-content');
                        if (expandedContent) {
                            expandedContent.style.display = 'none';
                        }
                        
                        // Показываем превью
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
                    
                    // Сбрасываем высоту сетки
                    expandableGrid.style.height = '';
                    
                    // Показываем все элементы сетки
                    const gridItems = expandableGrid.querySelectorAll('.expandable-item');
                    gridItems.forEach(item => {
                        item.removeAttribute('style');
                        
                        // Восстанавливаем превью
                        const preview = item.querySelector('.item-preview');
                        if (preview) {
                            preview.style.display = 'flex';
                            preview.style.opacity = '1';
                        }
                    });
                }
            }
            
            // Инициализируем сетку заново
            setupExpandableGrid();
        }, 100);
    }
}

// Функция для обновления заголовка страницы
function updatePageTitle(pageName = 'home', categoryName = null) {
    let title = 'LogovoDushnil';
    
    if (pageName === 'category' && categoryName) {
        // Находим имя категории для отображения в заголовке
        const categoryItem = document.querySelector(`.category-item[data-category="${categoryName}"]`);
        if (categoryItem) {
            const categoryNameElement = categoryItem.querySelector('.category-name');
            if (categoryNameElement) {
                title = categoryNameElement.textContent + ' | ' + title;
            }
        }
    } else if (pageName === 'feed') {
        title = 'Лента | ' + title;
    }
    
    document.title = title;
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
    
    // Переключение между страницами в меню
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
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
    
    // Обновленная версия обработчика для кнопки "назад"
document.querySelectorAll('.back-button').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Перед возвратом к списку категорий, проверяем, есть ли расширенный элемент
        const currentCategoryPage = button.closest('.category-page');
        if (currentCategoryPage) {
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
        }
        
        // Переходим к списку категорий
        navigateTo('list', 'feed');
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
}

// Функция для навигации между страницами с использованием хеш-навигации
function navigateTo(hash, pageName, categoryName = null) {
    // Меняем хеш в URL (это автоматически вызовет событие hashchange)
    window.location.hash = hash;
    
    // Показываем нужную страницу
    showPage(pageName, categoryName);
    
    // Обновляем заголовок страницы
    updatePageTitle(pageName, categoryName);
    
    // Прокручиваем страницу вверх
    window.scrollTo(0, 0);
}

// Функция для показа нужной страницы
function showPage(pageName, categoryName = null) {
    // Скрываем все страницы
    document.querySelector('.home-page').style.display = 'none';
    document.querySelector('.feed-page').style.display = 'none';
    
    // Скрываем все страницы категорий
    const categoryPages = document.querySelectorAll('.category-page');
    categoryPages.forEach(page => {
        page.style.display = 'none';
    });
    
    // Удаляем класс active у всех элементов меню
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
    });
    
    // Показываем нужную страницу и активируем соответствующий пункт меню
    if (pageName === 'home') {
        document.querySelector('.home-page').style.display = 'block';
        document.querySelector('.nav-item[data-page="home"]').classList.add('active');
        
        // Переустанавливаем обработчики просмотра изображений
        setupImageViewers();
    } else if (pageName === 'feed') {
        document.querySelector('.feed-page').style.display = 'block';
        document.querySelector('.nav-item[data-page="feed"]').classList.add('active');
    } else if (pageName === 'category' && categoryName) {
        // Находим соответствующую страницу категории и показываем её
        const categoryPageId = categoryName + '-page';
        const categoryPage = document.getElementById(categoryPageId);
        
        if (categoryPage) {
            categoryPage.style.display = 'block';
            document.querySelector('.nav-item[data-page="feed"]').classList.add('active');
        } else {
            console.error('Страница категории не найдена:', categoryPageId);
            // По умолчанию показываем первую категорию, если запрошенная не найдена
            document.getElementById('coding-page').style.display = 'block';
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

// Полностью переработанная функция для управления расширяемыми карточками
function setupExpandableGrid() {
    const grid = document.querySelector('.expandable-grid');
    if (!grid) {
        console.error("Не найдена сетка '.expandable-grid'");
        return;
    }
    
    const items = grid.querySelectorAll('.expandable-item');
    if (items.length === 0) {
        console.error("Не найдены элементы '.expandable-item'");
        return;
    }
    
    let expandedItem = null;
    let originalGridHeight = grid.offsetHeight;
    let isAnimating = false; // Флаг для предотвращения параллельных анимаций
    
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
    
    // Функция для отображения расширенного элемента с улучшенной анимацией
function expandItem(item) {
    // Если анимация уже идет или элемент уже расширен, ничего не делаем
    if (isAnimating || item === expandedItem) return;
    
    isAnimating = true;
    
    // Проверка элемента
    if (!item) {
        console.error("Попытка расширить пустой элемент");
        isAnimating = false;
        return;
    }
    
    // Находим расширенное содержимое
    const expandedContent = item.querySelector('.item-expanded-content');
    if (!expandedContent) {
        console.error("Расширенное содержимое не найдено", item);
        isAnimating = false;
        return;
    }
    
    try {
        // Находим превью и НЕМЕДЛЕННО скрываем его перед началом анимации
        const preview = item.querySelector('.item-preview');
        if (preview) {
            // Мгновенно скрываем превью без анимации
            preview.style.display = 'none';
            preview.style.opacity = '0';
            
            // Также скрываем изображение внутри превью
            const image = preview.querySelector('.item-image');
            if (image) {
                image.style.display = 'none';
                image.style.opacity = '0';
            }
        }
        
        // Добавляем класс для анимации
        item.classList.add('animating');
        
        // Сохраняем оригинальную высоту сетки, если это первое открытие
        if (!expandedItem) {
            originalGridHeight = grid.offsetHeight || 200;
        }
        
        // Если уже есть открытый элемент, сначала плавно скрываем его
        if (expandedItem) {
            const oldContent = expandedItem.querySelector('.item-expanded-content');
            if (oldContent) {
                oldContent.style.opacity = '0';
                oldContent.style.transform = 'scale(0.95)';
            }
            
            expandedItem.classList.remove('animating');
            
            // Ждем немного, чтобы анимация скрытия содержимого началась
            setTimeout(() => {
                expandedItem.classList.remove('expanded');
                if (oldContent) {
                    oldContent.style.display = 'none';
                }
                
                // Теперь можно продолжить с новым элементом
                continueWithNewItem();
            }, 200); // Короткая задержка для скрытия
        } else {
            // Если нет расширенного элемента, сразу переходим к новому
            continueWithNewItem();
        }
        
        // Функция для продолжения анимации с новым элементом
        function continueWithNewItem() {
            // Перед изменением убираем все встроенные стили у других элементов
            items.forEach(otherItem => {
                if (otherItem !== item) {
                    // Добавляем класс для анимации скрытия
                    otherItem.style.opacity = '0';
                    otherItem.style.transform = 'translateY(10px)';
                }
            });
            
            // Даем время для начала анимации скрытия
            setTimeout(() => {
                // Теперь физически скрываем все элементы, кроме выбранного
                items.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.style.display = 'none';
                    }
                });
                
                // Плавно увеличиваем высоту сетки
                grid.style.height = Math.max(500, originalGridHeight) + 'px';
                
                // Добавляем класс expanded к выбранному элементу
                item.classList.add('expanded');
                
                // Показываем содержимое с небольшой задержкой для плавности
                setTimeout(() => {
                    expandedContent.style.display = 'block';
                    
                    // Форсируем перерасчет макета перед анимацией
                    void item.offsetHeight;
                    
                    // Запускаем анимацию появления содержимого
                    expandedContent.style.opacity = '1';
                    expandedContent.style.transform = 'scale(1)';
                    
                    // Адаптируем высоту сетки под содержимое
                    setTimeout(() => {
                        grid.style.height = Math.max(expandedContent.scrollHeight + 40, 500) + 'px';
                        
                        // Завершаем анимацию
                        expandedItem = item;
                        item.classList.remove('animating');
                        isAnimating = false;
                    }, 300);
                }, 50);
            }, 200); // Даем время для анимации скрытия других элементов
        }
    } catch (error) {
        console.error("Ошибка при анимации:", error);
        isAnimating = false;
        item.classList.remove('animating');
    }
}

    // Функция для скрытия расширенного элемента
    function collapseExpandedItem() {
        if (!expandedItem || isAnimating) return;
        
        isAnimating = true;
        
        try {
            // Находим расширенное содержимое
            const expandedContent = expandedItem.querySelector('.item-expanded-content');
            if (!expandedContent) {
                isAnimating = false;
                return;
            }
            
            // Скрываем содержимое с анимацией
            expandedContent.style.opacity = '0';
            expandedContent.style.transform = 'scale(0.95)';
            
            // Возвращаем оригинальную высоту сетки
            grid.style.height = originalGridHeight + 'px';
            
            // Ждем завершения анимации скрытия
            setTimeout(() => {
                // Снимаем класс expanded
                expandedItem.classList.remove('expanded');
                expandedContent.style.display = 'none';
                
                // Восстанавливаем видимость превью
                const preview = expandedItem.querySelector('.item-preview');
                if (preview) {
                    preview.style.display = 'flex';
                    preview.style.opacity = '1';
                    
                    // Убедимся, что изображение правильно отображается
                    const image = preview.querySelector('.item-image');
                    if (image) {
                        image.style.display = 'block';
                        image.style.opacity = '1';
                        image.style.height = '120px';
                        image.style.maxHeight = '120px';
                    }
                    
                    // Убедимся, что детали превью правильно отображаются
                    const details = preview.querySelector('.item-details');
                    if (details) {
                        details.style.display = 'block';
                        details.style.opacity = '1';
                    }
                }
                
                // Сначала показываем все элементы, но с нулевой непрозрачностью
                items.forEach(item => {
                    item.style.display = '';
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(10px)';
                    
                    // Убедимся, что превью видимо
                    const itemPreview = item.querySelector('.item-preview');
                    if (itemPreview) {
                        itemPreview.style.display = 'flex';
                        itemPreview.style.opacity = '1';
                        
                        // Фиксируем размеры изображения
                        const itemImage = itemPreview.querySelector('.item-image');
                        if (itemImage) {
                            itemImage.style.height = '120px';
                            itemImage.style.maxHeight = '120px';
                        }
                    }
                });
                
                // Даем время для перерисовки DOM
                setTimeout(() => {
                    // Запускаем анимацию появления всех элементов
                    items.forEach(item => {
                        item.style.opacity = '1';
                        item.style.transform = '';
                        
                        // ВАЖНОЕ ИСПРАВЛЕНИЕ: Полностью сбрасываем встроенные стили
                        // через небольшую задержку, чтобы анимация появления завершилась
                        setTimeout(() => {
                            // Полностью сбрасываем встроенные стили элемента
                            item.removeAttribute('style');
                            
                            // Принудительно устанавливаем нужные стили для превью
                            const itemPreview = item.querySelector('.item-preview');
                            if (itemPreview) {
                                itemPreview.style.display = 'flex';
                                itemPreview.style.opacity = '1';
                                
                                // И для его содержимого
                                const itemImage = itemPreview.querySelector('.item-image');
                                if (itemImage) {
                                    itemImage.style.display = 'block';
                                    itemImage.style.opacity = '1';
                                    itemImage.style.height = '120px';
                                    itemImage.style.maxHeight = '120px';
                                }
                                
                                const itemDetails = itemPreview.querySelector('.item-details');
                                if (itemDetails) {
                                    itemDetails.style.display = 'block';
                                    itemDetails.style.opacity = '1';
                                }
                            }
                        }, 300);
                    });
                    
                    // Принудительно применяем нужные стили для всей сетки
                    setTimeout(() => {
                        // Повторная инициализация стилей для надежности
                        items.forEach(item => {
                            const itemPreview = item.querySelector('.item-preview');
                            if (itemPreview) {
                                itemPreview.style.display = 'flex';
                                itemPreview.style.opacity = '1';
                                
                                // Фиксируем размеры изображения
                                const itemImage = itemPreview.querySelector('.item-image');
                                if (itemImage) {
                                    itemImage.style.height = '120px';
                                    itemImage.style.maxHeight = '120px';
                                }
                            }
                        });
                        
                        // Обновляем высоту сетки
                        grid.style.height = 'auto';
                    }, 500);
                    
                    expandedItem = null;
                    isAnimating = false;
                }, 50);
            }, 300);
        } catch (error) {
            console.error("Ошибка при анимации закрытия:", error);
            isAnimating = false;
            
            // В случае ошибки принудительно восстанавливаем состояние
            if (expandedItem) {
                expandedItem.classList.remove('expanded');
                expandedItem.classList.remove('animating');
                const expandedContent = expandedItem.querySelector('.item-expanded-content');
                if (expandedContent) {
                    expandedContent.style.display = 'none';
                }
                
                // Восстанавливаем видимость превью и его содержимого
                const preview = expandedItem.querySelector('.item-preview');
                if (preview) {
                    preview.style.display = 'flex';
                    preview.style.opacity = '1';
                    
                    const image = preview.querySelector('.item-image');
                    if (image) {
                        image.style.display = 'block';
                        image.style.height = '120px';
                        image.style.maxHeight = '120px';
                    }
                    
                    const details = preview.querySelector('.item-details');
                    if (details) {
                        details.style.display = 'block';
                    }
                }
                
                items.forEach(item => {
                    // Полностью очищаем встроенные стили
                    item.removeAttribute('style');
                    
                    // Принудительно восстанавливаем превью
                    const itemPreview = item.querySelector('.item-preview');
                    if (itemPreview) {
                        itemPreview.style.display = 'flex';
                        itemPreview.style.opacity = '1';
                        
                        // Фиксируем размеры изображения
                        const itemImage = itemPreview.querySelector('.item-image');
                        if (itemImage) {
                            itemImage.style.height = '120px';
                            itemImage.style.maxHeight = '120px';
                        }
                    }
                });
                
                grid.style.height = 'auto';
                expandedItem = null;
            }
        }
    }
    
    // Добавляем обработчики событий на все элементы сетки
    items.forEach(item => {
        // Проверяем наличие элемента превью
        const previewElement = item.querySelector('.item-preview');
        if (previewElement) {
            previewElement.addEventListener('click', () => {
                expandItem(item);
            });
        } else {
            console.error("В элементе отсутствует '.item-preview'", item);
        }
        
        // Проверяем наличие кнопки закрытия
        const closeButton = item.querySelector('.close-expanded');
        if (closeButton) {
            closeButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Предотвращаем всплытие события
                collapseExpandedItem();
            });
        } else {
            console.error("В элементе отсутствует '.close-expanded'", item);
        }
    });
    
    // Закрытие расширенного элемента при нажатии Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && expandedItem) {
            collapseExpandedItem();
        }
    });
}