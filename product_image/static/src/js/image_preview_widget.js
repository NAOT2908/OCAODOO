/** @odoo-module **/
// model for patch the imageField and add function for image preview
import { ImageField } from '@web/views/fields/image/image_field';
import { patch } from "@web/core/utils/patch";

function removeEnlargedImage() {
    const enlargedImg = document.querySelector(".enlarged-image");
    if (enlargedImg) {
        document.body.removeChild(enlargedImg);
    }
    const blurredBg = document.querySelector(".blurred-bg");
    if (blurredBg) {
        document.body.removeChild(blurredBg);
    }
    const closeButton = document.querySelector(".close-button");
    if (closeButton) {
        document.body.removeChild(closeButton);
    }
    document.body.classList.remove("enlarged-image-body");
    document.removeEventListener("keydown", handleEscKey);
}

function handleEscKey(event) {
    if (event.key === "Escape") {
        removeEnlargedImage();
    }
    if (event.key === "r"){
        rotateImage()
    }
}

function rotateImage() {
    const enlargedImg = document.querySelector(".enlarged-image");
    if (!enlargedImg) return;

    let currentRotation = parseInt(enlargedImg.getAttribute("data-rotation")) || 0;
    currentRotation = (currentRotation + 90) % 360; // Xoay 90 độ, nếu qua 360 độ thì trở về 0
    enlargedImg.style.transform = `scale(${enlargedImg.getAttribute("data-scale") || 1}) rotate(${currentRotation}deg)`;
    enlargedImg.setAttribute("data-rotation", currentRotation); // Lưu giá trị xoay hiện tại
}

function handleZoom(event) {
    // if (event.ctrlKey) { // Kiểm tra nếu phím Ctrl được nhấn
        event.preventDefault(); // Ngăn chặn hành vi cuộn mặc định
        const enlargedImg = event.target;
        let currentScale = parseFloat(enlargedImg.getAttribute("data-scale")) || 1;
        if (event.deltaY < 0) {
            // Cuộn lên -> Phóng to
            currentScale += 0.1;
        } else {
            // Cuộn xuống -> Thu nhỏ
            currentScale = Math.max(0.1, currentScale - 0.1); // Không cho thu nhỏ hơn 0.1
        }
        enlargedImg.style.transform = `scale(${currentScale})`;
        enlargedImg.setAttribute("data-scale", currentScale); // Lưu lại giá trị phóng to hiện tại
    // }
}

patch(ImageField.prototype, {
    img_click(ev) {
        const clickedImg = ev.target;
        if (document.body.classList.contains("enlarged-image-body")) {
            removeEnlargedImage();
            return;
        }

        const newImg = document.createElement("img");
        newImg.src = clickedImg.src.replace(/_128/g, "_1920"); // Thay đổi kích thước ảnh nếu cần
        newImg.classList.add("enlarged-image");
        newImg.style.position = "fixed";
        newImg.style.top = 0;
        newImg.style.bottom = 0;
        newImg.style.left = 0;
        newImg.style.right = 0;
        newImg.style.margin = "auto";
        newImg.style.maxWidth = "95%";
        newImg.style.maxHeight = "95%";
        newImg.style.zIndex = 9999;

        // Lưu lại tỷ lệ phóng to ban đầu
        newImg.setAttribute("data-scale", 1);

        // Thêm sự kiện cuộn cho ảnh để phóng to/thu nhỏ
        newImg.addEventListener("wheel", handleZoom);

        // Tạo nền mờ
        const blurredBg = document.createElement("div");
        blurredBg.classList.add("blurred-bg");
        blurredBg.style.position = "fixed";
        blurredBg.style.top = 0;
        blurredBg.style.bottom = 0;
        blurredBg.style.left = 0;
        blurredBg.style.right = 0;
        blurredBg.style.background = "rgba(0, 0, 0, 0.5)";
        blurredBg.style.backdropFilter = "blur(10px)";
        blurredBg.style.zIndex = 9998;
        // blurredBg.addEventListener("click", removeEnlargedImage);

        // Nút đóng
        const closeButton = document.createElement("button");
        closeButton.classList.add("close-button");
        closeButton.innerHTML = "Close";
        closeButton.style.position = "fixed";
        closeButton.style.top = "10px";
        closeButton.style.right = "10px";
        closeButton.style.padding = "5px";
        closeButton.style.background = "transparent";
        closeButton.style.border = "none";
        closeButton.style.color = "#fff";
        closeButton.style.fontSize = "16px";
        closeButton.style.zIndex = 9999;
        closeButton.addEventListener("click", removeEnlargedImage);

        // Thêm các phần tử vào body
        document.body.appendChild(blurredBg);
        document.body.appendChild(newImg);
        document.body.appendChild(closeButton);

        // Đánh dấu trạng thái hình ảnh được phóng to
        document.body.classList.add("enlarged-image-body");

        // Sự kiện ESC để đóng ảnh
        document.addEventListener("keydown", handleEscKey);
    },
});
