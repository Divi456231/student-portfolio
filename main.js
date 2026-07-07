(function () {
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    highlightActiveNav();
    setupPlanner();
    setupContactForm();

    function highlightActiveNav() {
        const page = document.body.dataset.page;
        const links = document.querySelectorAll('.site-nav a');

        links.forEach((link) => {
            const target = link.getAttribute('href');
            const isActive = (page === 'home' && target === 'index.html') || target.includes(`${page}.html`);
            if (isActive) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });
    }

    function setupPlanner() {
        const form = document.getElementById('taskForm');
        const input = document.getElementById('taskInput');
        const list = document.getElementById('taskList');
        const message = document.getElementById('taskMessage');
        const total = document.getElementById('taskTotal');
        const done = document.getElementById('taskDone');
        const pending = document.getElementById('taskPending');

        if (!form || !input || !list) {
            return;
        }

        let tasks = loadTasks();
        renderTasks();

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const value = input.value.trim();

            if (!value) {
                showPlannerMessage('Please enter a task before adding it.');
                return;
            }

            tasks.unshift({ id: Date.now(), text: value, completed: false });
            input.value = '';
            saveTasks();
            renderTasks('Task added successfully.');
        });

        list.addEventListener('click', (event) => {
            const button = event.target.closest('button[data-action]');
            if (!button) {
                return;
            }

            const itemId = Number(button.closest('li')?.dataset.id);
            const taskIndex = tasks.findIndex((task) => task.id === itemId);
            if (taskIndex === -1) {
                return;
            }

            const action = button.dataset.action;
            if (action === 'toggle') {
                tasks[taskIndex].completed = !tasks[taskIndex].completed;
                saveTasks();
                renderTasks('Task updated.');
            }

            if (action === 'delete') {
                tasks.splice(taskIndex, 1);
                saveTasks();
                renderTasks('Task deleted.');
            }
        });

        function renderTasks(statusText = '') {
            list.innerHTML = '';

            if (tasks.length === 0) {
                list.innerHTML = '<li class="task-item"><span class="task-text">No tasks yet. Add one above to get started.</span></li>';
            } else {
                tasks.forEach((task) => {
                    const li = document.createElement('li');
                    li.className = `task-item ${task.completed ? 'completed' : ''}`;
                    li.dataset.id = task.id;

                    li.innerHTML = `
                        <span class="task-text">${escapeHtml(task.text)}</span>
                        <div class="task-actions">
                            <button type="button" class="complete-btn" data-action="toggle">${task.completed ? 'Undo' : 'Complete'}</button>
                            <button type="button" class="delete-btn" data-action="delete">Delete</button>
                        </div>
                    `;
                    list.appendChild(li);
                });
            }

            updateStats();
            showPlannerMessage(statusText);
        }

        function updateStats() {
            const completedCount = tasks.filter((task) => task.completed).length;
            const pendingCount = tasks.length - completedCount;

            if (total) total.textContent = tasks.length;
            if (done) done.textContent = completedCount;
            if (pending) pending.textContent = pendingCount;
        }

        function saveTasks() {
            localStorage.setItem('akaseDivineTasks', JSON.stringify(tasks));
        }

        function loadTasks() {
            const stored = localStorage.getItem('akaseDivineTasks');
            if (!stored) {
                return [
                    { id: 1, text: 'Review lecture notes', completed: false },
                    { id: 2, text: 'Complete web technology assignment', completed: true }
                ];
            }

            try {
                const parsed = JSON.parse(stored);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        }

        function showPlannerMessage(text) {
            if (!message) {
                return;
            }
            message.textContent = text || '';
        }
    }

    function setupContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) {
            return;
        }

        const fields = {
            name: document.getElementById('name'),
            email: document.getElementById('email'),
            phone: document.getElementById('phone'),
            message: document.getElementById('message')
        };

        const successEl = document.getElementById('contactSuccess');
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const digitsOnlyPattern = /^\d+$/;

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            let isValid = true;

            clearErrors();

            Object.entries(fields).forEach(([key, element]) => {
                if (!element || !element.value.trim()) {
                    setError(key, 'This field is required.');
                    isValid = false;
                }
            });

            if (fields.email && fields.email.value.trim() && !emailPattern.test(fields.email.value.trim())) {
                setError('email', 'Please enter a valid email address.');
                isValid = false;
            }

            if (fields.phone && fields.phone.value.trim() && !digitsOnlyPattern.test(fields.phone.value.trim())) {
                setError('phone', 'Phone number should contain digits only.');
                isValid = false;
            }

            if (isValid) {
                if (successEl) {
                    successEl.textContent = 'Message validated successfully. Form submission is ready.';
                }
                form.reset();
            } else if (successEl) {
                successEl.textContent = '';
            }
        });

        function setError(fieldName, text) {
            const errorEl = document.querySelector(`[data-error-for="${fieldName}"]`);
            if (errorEl) {
                errorEl.textContent = text;
            }
        }

        function clearErrors() {
            document.querySelectorAll('.error-message').forEach((el) => {
                el.textContent = '';
            });
        }
    }

    function escapeHtml(value) {
        return value
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }
})();