
window.onModalReady = (function() {
    window.Modal = null;
    var handlers = [];

    require(
        [
            "./source/Modal",
            "./source/ModalImage"
        ],
        function(ModalModule, ModalImageModule) {
            window.Modal = ModalModule.default;
            window.Modal.module = ModalModule;

            window.ModalImage = ModalImageModule.default;
            window.ModalImage.module = ModalImageModule;

            handlers.forEach(function(handler) {
                handler(window.Modal);
            });
            handlers = [];
        }
    );

    return function onModalReady(handler) {
        if (window.Modal) handler();
        else handlers.push(handler);
    }
})();
