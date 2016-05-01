import { show, hide } from 'redux-modal/lib/actions'


export function alert(message) {
    return show('alert', { message })
}

export function unavailable() {
    return alert('Данная функция находится в разработке')
}