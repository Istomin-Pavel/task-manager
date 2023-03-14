'use strict';

let habbits = [];
const HABBIT_KEY = 'HABBIT_KEY';
let globalactiveHabbitId;

// page

const page = {
    menu: document.querySelector('.menu__list'),
    header: {
        h1: document.querySelector('.h1'),
        progressPercent: document.querySelector('.progress__percent'),
        progressCoverBar: document.querySelector('.progress__cover__bar')
    },
    content: {
        daysContainer: document.querySelector('[id="days"]'),
        nextDay: document.querySelector('.habbit__day')
    },
    popup: {
        index: document.querySelector('[id="add-habbit-popup"]'),
        iconField: document.querySelector('.popup-form input[name="icon"]')
    }
}

                    //utils

//получение данных от пользователя
function loadData(){
    const habbitSring = localStorage.getItem(HABBIT_KEY); //получаем данные из local Storage
    const habbitArray = JSON.parse(habbitSring); //преобразуем JSON объект в JS объект
    if (Array.isArray(habbitArray)){ //проверяем что получили именно массиы
        habbits = habbitArray;
    }
}

//загрузка данных в LS
function saveData(){
    localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

// при загрузке приложения и/или выборе пункта меню - изменяется меню, шапка, контент

// создаёт меню если его изначально нет в HTML при загрузке/перезагрузке
function rerenderMenu(activeHabbit) { //принимает объект "активная привычка)"
    for(const habbit of habbits){
        const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
        if(!existed){
            const element = document.createElement('button');
            element.addEventListener('click', () => rerender(habbit.id));
            element.classList.add('menu__item');
            element.setAttribute('menu-habbit-id', habbit.id);
            element.innerHTML = `<img src="images/${habbit.icon}.svg" alt="${habbit.name}"/>`;
            if(activeHabbit.id === habbit.id){
                element.classList.add('menu__item__active');
            }
            page.menu.appendChild(element);
            continue;
        }
        if(activeHabbit.id === habbit.id){
            existed.classList.add('menu__item__active');
        }
        else {existed.classList.remove('menu__item__active');}
    }
}

function rerenderHead(activeHabbit) {
    page.header.h1.innerText = activeHabbit.name;

    const progress = activeHabbit.days.length / activeHabbit.target > 1
    ? 100
    : activeHabbit.days.length / activeHabbit.target * 100;

    page.header.progressPercent.innerText = progress.toFixed(0) + '%';
    page.header.progressCoverBar.setAttribute('style', `width:${progress}%`);
}

function rerenderContent(activeHabbit){
    page.content.daysContainer.innerHTML = ''; // обнуление контента при переходе между привычками, иначе контент из старых привычек будет сохраняться
    for(const index in activeHabbit.days){
        const element = document.createElement('div');
        element.classList.add('habbit');
        element.innerHTML = 
        `<div class="habbit__day">День ${Number(index) + 1}</div>
         <div class="habbit__comment">${activeHabbit.days[index].comment}</div>
         <button class="habbit__delete" onclick="deleteDay(${index})">
            <img src="images/shape.svg" alt="Удалить день ${Number(index) + 1}"/>
         </button>`;
        page.content.daysContainer.appendChild(element);
    }
    page.content.nextDay.innerHTML = `День ${activeHabbit.days.length + 1}`;
}

//срабатывает при сабмите формы
function addDays(event){
    event.preventDefault(); //предотвращает дефолтное поведение события

    /*const form = event.target; //event.target возвращает объект формы
    const data = new FormData(form); //форм дата получает данные от формы
    const comment = data.get('comment'); //получаем данные(комментарий) из inputa формы
    form['comment'].classList.remove('error');
    if (!comment) {
            form['comment'].classList.add('error');
            return;
        }
    */

    const data = validateAndGetFormData(event.target, ['comment']);
    if (!data) {
        return;
    }

    habbits = habbits.map(habbit => {
        if(habbit.id === globalactiveHabbitId){
            return {
                ...habbit,
                days:habbit.days.concat([{comment: data.comment}])

                //days:habbit.days.concat([{comment}])
            }
        }
        return habbit;
    });

    resetForm(event.target, ['comment']);

    //form['comment'].value = '';
    rerender(globalactiveHabbitId);
    saveData();
}

//срабатывает при клике на корзину, через onclick в rerrenderContent()
function deleteDay(index){
    habbits = habbits.map(habbit =>{
        if(habbit.id === globalactiveHabbitId){
            habbit.days.splice(index, 1);
            return {
                ...habbit,
                days: habbit.days
            }
        } 
        return habbit;
    });
    rerender(globalactiveHabbitId);
    saveData();
}

function togglePopup() {
    if(page.popup.index.classList.contains('cover__hidden')){
        page.popup.index.classList.remove('cover__hidden');
    }
    else page.popup.index.classList.add('cover__hidden');
}

function resetForm(form, fields) {
    for (const field of fields) {
        form[field].value = '';
    }
}

function validateAndGetFormData(form, fields) {
    const formData = new FormData(form);
    const res = {};
    for (const field of fields) {
        const fieldValue = formData.get(field);
        form[field].classList.remove('error');
        if (!fieldValue) { //если нет данных в поле (поле пустое), но клик прошел, то...
            form[field].classList.add('error');
            return;
        }
        res[field] = fieldValue;
    }
    let isValid = true;
    for (const field of fields) {
        if (!res[field]) {
            isValid = false;
        }
    }
    if(!isValid){
        return;
    }
    return res;
}

function setIcon(context, icon) { //получаем блок context клика при помощи this
    page.popup.iconField.value = icon; //устанавливаем в скрытое поле значение icon
    document.querySelector('.icon.icon-active').classList.remove('icon-active');
    /*const activeIcon = document.querySelector('.icon.icon-active');
    activeIcon.classList.remove('icon-active');*/
    context.classList.add('icon-active');
}

function addHabbit(event) {
    event.preventDefault();
    const data = validateAndGetFormData(event.target, ['name', 'icon', 'target']);
    if (!data) {
        return;
    }
    const maxId = habbits.reduce((acc, habbit) => acc > habbit.id ? acc : habbit.id, 0);
    habbits.push({
        id: maxId + 1,
        name: data.name,
        target: data.target,
        icon: data.icon,
        days: []
    })
    resetForm(event.target, ['name', 'target']);
    togglePopup();
    saveData();
    rerender(maxId + 1);
}

//срабатывает при старте приложения и при клике по пунктам меню (вызывается из rerenderMenu())
function rerender(activeHabbitId){ //при загрузке ставит habbits[0].id
    globalactiveHabbitId = activeHabbitId; //записывает id в глобальную переменную
    const activeHabbit = habbits.find(habbit => habbit.id === activeHabbitId);
    if(!activeHabbit) return; // !непонятная проверка
    /*передаём объект "активная привычка" в функции*/
    document.location.replace(document.location.pathname + '#' + activeHabbitId);
    rerenderMenu(activeHabbit);
    rerenderHead(activeHabbit);
    rerenderContent(activeHabbit);
}

// загрузка приложения
(() => {
    loadData(); //получаем данные из LS и записываем их в массив habbits
    const hashId = Number(document.location.hash.replace('#', ''));
    const urlHabbit = habbits.find(habbit => habbit.id == hashId);
    if (urlHabbit) {
        rerender(urlHabbit.id);
    }
    else rerender(habbits[0].id);
})();