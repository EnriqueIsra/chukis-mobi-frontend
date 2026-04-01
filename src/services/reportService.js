import axiosInstance from "./axiosConfig"

export const getMonthlySummary = async (year, month) => {
    try {
        const response = await axiosInstance.get("/reports/monthly-summary", {
            params: { year, month }
        });
        return response;
    } catch (error) {
        console.error(error);
    }
    return null;
}
