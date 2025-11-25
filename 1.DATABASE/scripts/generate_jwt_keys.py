#!/usr/bin/env python3
"""
Generate EdDSA (Ed25519) key pair for JWT signing.

This script generates a cryptographically secure Ed25519 key pair
for use with JWT authentication in the Next.js frontend.

Security Requirements:
- Private key must be kept SECRET and never committed to version control
- Public key can be shared and used for token verification
- Keys are generated using Python's cryptography library
- Compatible with jose library's EdDSA algorithm

Usage:
    python3 generate_jwt_keys.py
"""

from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization


def generate_ed25519_keypair():
    """
    Generate an Ed25519 key pair for EdDSA JWT signing.

    Returns:
        tuple: (private_key_pem, public_key_pem) as strings
    """
    # Generate private key
    private_key = ed25519.Ed25519PrivateKey.generate()

    # Serialize private key to PEM format
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    ).decode('utf-8')

    # Get public key from private key
    public_key = private_key.public_key()

    # Serialize public key to PEM format
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode('utf-8')

    return private_pem, public_pem


def format_for_env_file(key_string):
    """
    Format a multi-line PEM key for .env.local file.

    Replaces newlines with \\n for proper .env formatting.

    Args:
        key_string: PEM-formatted key string

    Returns:
        str: Formatted key string for .env file
    """
    return key_string.replace('\n', '\\n')


def main():
    print("=" * 70)
    print("JWT EdDSA (Ed25519) Key Pair Generator")
    print("=" * 70)
    print()

    # Generate keys
    print("Generating Ed25519 key pair...")
    private_key_pem, public_key_pem = generate_ed25519_keypair()
    print("✓ Key pair generated successfully")
    print()

    # Display security warnings
    print("⚠️  SECURITY WARNINGS:")
    print("=" * 70)
    print("1. NEVER commit the private key to version control")
    print("2. Add frontend/.env.local to .gitignore (should already be there)")
    print("3. The private key grants full authentication authority")
    print("4. Store private key securely (password manager, secrets vault)")
    print("5. Rotate keys periodically (every 90 days recommended)")
    print("6. If private key is compromised, regenerate immediately")
    print("=" * 70)
    print()

    # Display raw keys for reference
    print("RAW KEYS (for reference):")
    print("-" * 70)
    print("\nPrivate Key (PEM):")
    print(private_key_pem)
    print("\nPublic Key (PEM):")
    print(public_key_pem)
    print("-" * 70)
    print()

    # Format keys for .env.local
    private_key_env = format_for_env_file(private_key_pem)
    public_key_env = format_for_env_file(public_key_pem)

    # Display formatted keys for .env.local
    print("ADD TO frontend/.env.local:")
    print("=" * 70)
    print(f'JWT_PRIVATE_KEY="{private_key_env}"')
    print(f'JWT_PUBLIC_KEY="{public_key_env}"')
    print("=" * 70)
    print()

    # Display usage instructions
    print("USAGE INSTRUCTIONS:")
    print("-" * 70)
    print("1. Copy the JWT_PRIVATE_KEY and JWT_PUBLIC_KEY lines above")
    print("2. Paste them into: frontend/.env.local")
    print("3. Verify .env.local is in .gitignore")
    print("4. Restart your Next.js dev server: npm run dev")
    print("5. Test JWT signing with lib/auth/jwt.ts functions")
    print("-" * 70)
    print()

    # Display verification steps
    print("VERIFICATION STEPS:")
    print("-" * 70)
    print("1. Check keys are loaded:")
    print("   console.log('Private key loaded:', !!process.env.JWT_PRIVATE_KEY)")
    print("   console.log('Public key loaded:', !!process.env.JWT_PUBLIC_KEY)")
    print()
    print("2. Test JWT generation:")
    print("   const token = await generateToken({ userId: '123', role: 'user' })")
    print("   console.log('Generated token:', token)")
    print()
    print("3. Test JWT verification:")
    print("   const payload = await verifyToken(token)")
    print("   console.log('Verified payload:', payload)")
    print("-" * 70)
    print()

    print("✓ Key generation complete!")
    print()


if __name__ == "__main__":
    main()
