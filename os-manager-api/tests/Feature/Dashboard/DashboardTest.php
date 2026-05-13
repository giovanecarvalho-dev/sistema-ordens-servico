<?php

namespace Tests\Feature\Dashboard;

use App\Models\User;
use Tests\TestCase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth; 

class DashboardTest extends TestCase
{
    public function test_admin_pode_ver_dashboard()
    {
        // Arrange
        $admin = User::factory()->create([
            'cargo_id' => 1,
        ]);

        $token = JWTAuth::fromUser($admin);

        // Act
        $response = $this->withHeader(
            'Authorization',
            "Bearer {$token}"
        )->getJson('/api/dashboard/estatisticas');

        // Assert
        $response->assertStatus(200);
    }
}