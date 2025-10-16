// Test script to create admin user and test login

async function testLogin() {
  try {
    // First, let's try to create an admin user
    console.log("Creating admin user...");
    const createResponse = await fetch("http://localhost:3000/v2/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: "Admin",
        lastName: "User",
        email: "admin@test.com",
        password: "admin123",
      }),
    });

    const createData = await createResponse.json();
    if (createResponse.ok) {
      console.log("Admin user created:", createData);
    } else {
      console.log("User creation response:", createData);
    }

    // Now test login
    console.log("\nTesting login...");
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
    console.log("Login response status:", loginResponse.status);
    console.log("Login response data:", loginData);

    if (loginResponse.ok && loginData.token) {
      console.log("\nTesting user endpoint with token...");
      const userResponse = await fetch("http://localhost:3000/v2/user", {
        headers: {
          Authorization: `Bearer ${loginData.token}`,
        },
      });

      const userData = await userResponse.json();
      console.log("User endpoint response status:", userResponse.status);
      console.log("User data:", userData);
    }
  } catch (error) {
    console.error("Test error:", error);
  }
}

testLogin();
