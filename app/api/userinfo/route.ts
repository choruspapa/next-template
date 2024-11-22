const fetchData = async (auth: string): Promise<UserInfo> => {
  if (!auth) {
    throw new Error('No access token found');
  }

  const response = await fetch(`${process.env.AUTH_KEYCLOAK_ISSUER}/protocol/openid-connect/userinfo`, {
    headers: {
        Authorization: auth,
    },
  });

  const data = await response.json();
  const userInfo : UserInfo = {
    preferredUsername: data.preferred_username,
    displayName: data.displayName,
    employeeId: data.employeeID,
  }
  return userInfo;
}

export async function GET(request: Request) {
  try {
    const userInfo = await fetchData(request.headers.get('Authorization') || "");
    return Response.json(userInfo);
  } catch (error) {
    console.error("Error on fetchData ", error);
    return Response.json(
      { success: false, message: "Permission denied."},
      { status: 403 },
    );
  }
}
