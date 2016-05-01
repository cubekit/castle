class OnlyLast {

    _lastPromise = null

    push(promise) {
        if (this._hasPendingPromise()) {
            this._lastPromise.reject()
        }

        return (this._lastPromise = promise)
    }

    _hasPendingPromise() {
        return (
            this._lastPromise &&
            this._lastPromise.state() != 'resolved'
        )
    }
}

export default OnlyLast