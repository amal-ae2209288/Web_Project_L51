import {
  getTotalUsers,
  getTotalPosts,
  getTotalComments,
  getTotalLikes,
  getAveragePostsPerUser,
  getTopFollowedUsers
} from "@/lib/repository";

export default async function StatsPage() {

  const totalUsers = await getTotalUsers();
  const totalPosts = await getTotalPosts();
  const totalComments = await getTotalComments();
  const totalLikes = await getTotalLikes();
  const avgPosts = await getAveragePostsPerUser();
  const topUsers = await getTopFollowedUsers();

  return (

<div style={{padding: "40px",fontFamily: "Arial",backgroundColor: "#f5f5f5",minHeight: "100vh"}}>

    <h1 style={{ marginBottom: "30px" }}>Statistics Dashboard</h1>

    {/*Statistics Cards*/}
    <div style={{display: "grid",gridTemplateColumns: "repeat(2, 1fr)",gap: "20px"}}>
        
    <div style={{backgroundColor: "white",padding: "20px",borderRadius: "10px"}}>
        <h3>Total Users</h3>
        <p>{totalUsers}</p>
    </div>

    <div style={{backgroundColor: "white",padding: "20px",borderRadius: "10px"}}>
        <h3>Total Posts</h3>
        <p>{totalPosts}</p>
    </div>

    <div style={{backgroundColor: "white",padding: "20px",borderRadius: "10px"}}>
          <h3>Total Comments</h3>
          <p>{totalComments}</p>
    </div>

    <div style={{backgroundColor: "white",padding: "20px",borderRadius: "10px"}}>
          <h3>Total Likes</h3>
          <p>{totalLikes}</p>
    </div>

    <div style={{backgroundColor: "white",padding: "20px",borderRadius: "10px"}}>
          <h3>Average Posts Per User</h3>
          <p>{avgPosts.toFixed(2)}</p>
    </div>

    </div>

    {/*Top Users Section*/}
    <div style={{backgroundColor: "white",padding: "20px",borderRadius: "10px",marginTop: "30px"}}>
    <h2>Top 5 Followed Users</h2>

    <ul>
        {topUsers.map((user: any) => (
            <li key={user.id}>
              {user.username} — {user._count.followers} followers
            </li>
          ))}
    </ul>

    </div>

</div>
);
}