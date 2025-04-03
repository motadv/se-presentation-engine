interface Observable<T> {
  subscribeObserver(observer: Observer<T>): void;
  unsubscribeObserver(observer: Observer<T>): void;
  notifyObservers(data: T): void;
}

interface Observer<T> {
  update(data: T): void;
}

export { Observable, Observer };
