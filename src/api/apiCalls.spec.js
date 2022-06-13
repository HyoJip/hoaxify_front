import axios from "axios";
import * as apiCalls from "./apiCalls";

describe("apiCalls", () => {
	describe("signup", () => {
		it("calls /api/1.0/users", () => {
			const mockSignup = jest.fn();
			axios.post = mockSignup;
			apiCalls.signup();

			const path = mockSignup.mock.calls[0][0];
			expect(path).toBe("/api/1.0/users");
		});
	});

	describe("login", () => {
		it("calls /api/1.0/login", () => {
			const mockLogin = jest.fn();
			axios.post = mockLogin;
			apiCalls.login({ username: "test-user", password: "P4ssword" });
			const path = mockLogin.mock.calls[0][0];
			expect(path).toBe("/api/1.0/login");
		});
	});

	describe("listUser", () => {
		it("calls /api/1.0/users?page=5&size=10 when no param provided for listUsers", () => {
			const mockListUsers = jest.fn();
			axios.get = mockListUsers;
			apiCalls.listUsers();
			expect(mockListUsers).toBeCalledWith("/api/1.0/users?page=0&size=3");
		});
		it("calls /api/1.0/users?page=5&size=10 when corresponding params provided for listUsers", () => {
			const mockListUsers = jest.fn();
			axios.get = mockListUsers;
			apiCalls.listUsers({ page: 5, size: 10 });
			expect(mockListUsers).toBeCalledWith("/api/1.0/users?page=5&size=10");
		});
		it("calls /api/1.0/users?page=5&size=3 when only page param provided for listUsers", () => {
			const mockListUsers = jest.fn();
			axios.get = mockListUsers;
			apiCalls.listUsers({ page: 5 });
			expect(mockListUsers).toBeCalledWith("/api/1.0/users?page=5&size=3");
		});
		it("calls /api/1.0/users?page=0&size=3 when only size param provided for listUsers", () => {
			const mockListUsers = jest.fn();
			axios.get = mockListUsers;
			apiCalls.listUsers({ size: 3 });
			expect(mockListUsers).toBeCalledWith("/api/1.0/users?page=0&size=3");
		});
		it("calls /api/1.0/user/user5 when user5 is provided for getUser", () => {
			const mockGetUser = jest.fn();
			axios.get = mockGetUser;
			apiCalls.getUser("user5");
			expect(mockGetUser).toBeCalledWith("/api/1.0/users/user5");
		});
	});

	describe("updateUser", () => {
		it("calls /api/1.0/users/5 when 5 is provided for updateUser", () => {
			const mockUpdateUser = jest.fn();
			axios.put = mockUpdateUser;
			apiCalls.updateUser("5");

			const path = mockUpdateUser.mock.calls[0][0];
			expect(path).toBe("/api/1.0/users/5");
		});
	});

	describe("postHoax", () => {
		it("calls /api/1.0/hoaxes", () => {
			const mockPostHoax = jest.fn();
			axios.post = mockPostHoax;
			apiCalls.postHoax();
			const path = mockPostHoax.mock.calls[0][0];
			expect(path).toBe("/api/1.0/hoaxes");
		});
	});

	describe("loadHoaxes", () => {
		it("calls /api/1.0/hoaxes?page=0&size=5&sort=id,desc when no param provided", () => {
			const mockGetHoaxes = jest.fn();
			axios.get = mockGetHoaxes;
			apiCalls.loadHoaxes();
			expect(mockGetHoaxes).toBeCalledWith("/api/1.0/hoaxes?page=0&size=5&sort=id,desc");
		});
		it("calls /api/1.0/users/username/hoaxes?page=0&size=5&sort=id,desc when username provided", () => {
			const mockGetHoaxes = jest.fn();
			axios.get = mockGetHoaxes;
			const username = "user1";
			apiCalls.loadHoaxes(username);
			expect(mockGetHoaxes).toBeCalledWith(
				`/api/1.0/users/${username}/hoaxes?page=0&size=5&sort=id,desc`
			);
		});
	});

	describe("loadOldHoaxes", () => {
		it("calls /api/1.0/hoaxes/5?direction=before&page=0&size=5&sort=id,desc when hoaxId was provided", () => {
			const mockGetOldHoaxes = jest.fn();
			axios.get = mockGetOldHoaxes;
			apiCalls.loadOldHoaxes(5);
			expect(mockGetOldHoaxes).toHaveBeenCalledWith(
				"/api/1.0/hoaxes/5?direction=before&page=0&size=5&sort=id,desc"
			);
		});
		it("calls /api/1.0/users/user1/hoaxes/5?direction=before&page=0&size=5&sort=id,desc when hoaxId and username were provided", () => {
			const mockGetOldHoaxes = jest.fn();
			axios.get = mockGetOldHoaxes;
			apiCalls.loadOldHoaxes(5, "user1");
			expect(mockGetOldHoaxes).toHaveBeenCalledWith(
				"/api/1.0/users/user1/hoaxes/5?direction=before&page=0&size=5&sort=id,desc"
			);
		});
	});

	describe("loadNewHoaxes", () => {
		it("calls /api/1.0/hoaxes/5?direction=after&sort=id,desc when hoaxId was provided", () => {
			const mockGetNewHoaxes = jest.fn();
			axios.get = mockGetNewHoaxes;
			apiCalls.loadNewHoaxes(5);
			expect(mockGetNewHoaxes).toHaveBeenCalledWith(
				"/api/1.0/hoaxes/5?direction=after&sort=id,desc"
			);
		});
		it("calls /api/1.0/users/user1/hoaxes/5?direction=after&sort=id,desc when hoaxId and username were provided", () => {
			const mockGetNewHoaxes = jest.fn();
			axios.get = mockGetNewHoaxes;
			apiCalls.loadNewHoaxes(5, "user1");
			expect(mockGetNewHoaxes).toHaveBeenCalledWith(
				"/api/1.0/users/user1/hoaxes/5?direction=after&sort=id,desc"
			);
		});
	});

	describe("countNewHoaxes", () => {
		it("calls /api/1.0/hoaxes/5?direction=after&count=true when hoaxId was provided", () => {
			const mockGetNewHoaxesCount = jest.fn();
			axios.get = mockGetNewHoaxesCount;
			apiCalls.countNewHoaxes(5);
			expect(mockGetNewHoaxesCount).toHaveBeenCalledWith(
				"/api/1.0/hoaxes/5?direction=after&count=true"
			);
		});
		it("calls /api/1.0/users/user1/hoaxes/5?direction=after&count=true when hoaxId and username were provided", () => {
			const mockGetNewHoaxesCount = jest.fn();
			axios.get = mockGetNewHoaxesCount;
			apiCalls.countNewHoaxes(5, "user1");
			expect(mockGetNewHoaxesCount).toHaveBeenCalledWith(
				"/api/1.0/users/user1/hoaxes/5?direction=after&count=true"
			);
		});
	});
	describe("postHoaxFile", () => {
		it("calls /api/1.0/hoaxes/upload", () => {
			const mockPostHoaxFile = jest.fn();
			axios.post = mockPostHoaxFile;
			apiCalls.postHoaxFile();
			const path = mockPostHoaxFile.mock.calls[0][0];
			expect(path).toBe("/api/1.0/hoaxes/upload");
		});
	});
	describe("deleteHoax", () => {
		it("calls /api/1.0/hoaxes/5 when hoax id param provided as 5", () => {
			const mockDelete = jest.fn();
			axios.delete = mockDelete;
			apiCalls.deleteHoax(5);
			const path = mockDelete.mock.calls[0][0];
			expect(path).toBe("/api/1.0/hoaxes/5");
		});
	});
});
