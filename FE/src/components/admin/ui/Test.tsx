import React, { Suspense } from "react";

// Component loading
const ContentSkeleton = () => <p>⏳ Đang tải...</p>;

// Hàm fake fetch dữ liệu
function fetchData() {
    return new Promise<string>((resolve) => {
        setTimeout(() => resolve("Nội dung đã load ✅"), 2000);
    });
}

// Resource wrapper
function createResource<T>(promise: Promise<T>) {
    let status = "pending";
    let result: T;

    const suspender = promise.then(
        (r) => {
            status = "success";
            result = r;
        },
        (e) => {
            status = "error";
            result = e;
        }
    );

    return {
        read() {
            if (status === "pending") throw suspender;
            if (status === "error") throw result;
            return result;
        },
    };
}

// Tạo resource từ fetch
const resource = createResource(fetchData());

function Content() {
    const data = resource.read(); // Suspense sẽ "bắt" cái throw promise ở đây
    return <p>{data}</p>;
}

export function Test() {
    return (
        <div style={{ padding: "20px" }}>
            {/* <h1>Ví dụ Suspense đơn giản</h1>
            <Suspense fallback={<ContentSkeleton />}>
                <Content />
            </Suspense> */}
        </div>
    );
}
