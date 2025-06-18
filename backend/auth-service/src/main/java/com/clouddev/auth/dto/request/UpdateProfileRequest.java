package com.clouddev.auth.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 更新用户资料请求DTO
 */
public class UpdateProfileRequest {

    @Size(max = 50, message = "名字长度不能超过50个字符")
    private String firstName;

    @Size(max = 50, message = "姓氏长度不能超过50个字符")
    private String lastName;

    @Size(max = 500, message = "头像URL长度不能超过500个字符")
    private String avatar;

    @Size(max = 20, message = "电话号码长度不能超过20个字符")
    @Pattern(regexp = "^[\\d\\s\\-\\+\\(\\)]*$", message = "电话号码格式不正确")
    private String phone;

    @Size(max = 500, message = "个人简介长度不能超过500个字符")
    private String bio;

    @Size(max = 100, message = "职位长度不能超过100个字符")
    private String jobTitle;

    @Size(max = 100, message = "公司长度不能超过100个字符")
    private String company;

    @Size(max = 100, message = "位置长度不能超过100个字符")
    private String location;

    @Size(max = 200, message = "网站URL长度不能超过200个字符")
    private String website;

    public UpdateProfileRequest() {}

    // Getters and Setters
    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    @Override
    public String toString() {
        return "UpdateProfileRequest{" +
                "firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", phone='" + phone + '\'' +
                ", jobTitle='" + jobTitle + '\'' +
                ", company='" + company + '\'' +
                ", location='" + location + '\'' +
                '}';
    }
}