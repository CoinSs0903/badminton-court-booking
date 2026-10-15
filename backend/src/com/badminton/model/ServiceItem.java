package com.badminton.model;

/**
 * Lớp đại diện cho Dịch vụ / Phụ kiện đi kèm tại sân cầu lông.
 */
public class ServiceItem {
    private String id;
    private String name;
    private String category; // RENTAL, SHUTTLECOCK, BEVERAGE
    private double unitPrice;
    private String unit;     // cái, ống, chai
    private String icon;     // icon identifier

    public ServiceItem() {}

    public ServiceItem(String id, String name, String category, double unitPrice, String unit, String icon) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.unitPrice = unitPrice;
        this.unit = unit;
        this.icon = icon;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(double unitPrice) { this.unitPrice = unitPrice; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String toJson() {
        return String.format(
            "{\"id\":\"%s\",\"name\":\"%s\",\"category\":\"%s\",\"unitPrice\":%.0f,\"unit\":\"%s\",\"icon\":\"%s\"}",
            id, escape(name), category, unitPrice, escape(unit), icon
        );
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\"", "\\\"");
    }
}
