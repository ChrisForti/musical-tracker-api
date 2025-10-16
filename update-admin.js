// Script to update user to admin status
async function updateUserToAdmin() {
  try {
    // First login to get a token
    console.log("Logging in as admin user...");
    const loginResponse = await fetch("http://localhost:3000/v2/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@test.com",
        password: "admin123",
      }),
    });

    const loginData = await loginResponse.json();
    console.log("Login response:", loginData);

    if (!loginResponse.ok || !loginData.token) {
      console.error("Login failed");
      return;
    }

    // Update user to admin
    console.log("\nUpdating user to admin...");
    const updateResponse = await fetch("http://localhost:3000/v2/user", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${loginData.token}`,
      },
      body: JSON.stringify({
        account_type: "admin",
      }),
    });

    const updateData = await updateResponse.json();
    console.log("Update response status:", updateResponse.status);
    console.log("Update response data:", updateData);

    // Verify the user is now admin
    console.log("\nVerifying user status...");
    const userResponse = await fetch("http://localhost:3000/v2/user", {
      headers: {
        Authorization: `Bearer ${loginData.token}`,
      },
    });

    const userData = await userResponse.json();
    console.log("Final user data:", userData);
    console.log("Is admin?", userData.isAdmin);
  } catch (error) {
    console.error("Error:", error);
  }
}

updateUserToAdmin();
