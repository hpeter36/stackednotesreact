/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverComponentsExternalPackages: ["sequelize"], // elszáll a sequelize import hibával ha ez nincs benne
	}
}

module.exports = nextConfig
