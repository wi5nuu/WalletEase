package com.payflow.response;

/**
 * SuccessResponse - Final class extending BaseResponse.
 * Represents successful API responses with data payload.
 * 
 * INHERITANCE: Extends BaseResponse (sealed hierarchy)
 */
public final class SuccessResponse<T> extends BaseResponse<T> {

    private final T data;

    SuccessResponse(T data, String message) {
        super("success", message);
        this.data = data;
    }

    @Override
    public T getData() {
        return data;
    }

    public static <T> SuccessResponse<T> of(T data, String message) {
        return new SuccessResponse<>(data, message);
    }
}
