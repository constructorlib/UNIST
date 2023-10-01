import argparse
import math


# Utility functions
def read_text_from_file(txt):
    with open(txt, 'r') as file:
        data = file.read()
    return data


def read_and_parse_public_key(public_key):
    key_data = {}
    with open(public_key, 'r') as file:
        for line in file:
            line = line.strip()
            key, value = line.split('=')
            key_data[key] = value
    return key_data


# RSA Key Generation
def greatest_common_divisor(a, b):
    if a == 0:
        return b
    return greatest_common_divisor(b % a, a)


def generate_rsa_keys(p, q):
    modulus = p * q
    phi = (p - 1) * (q - 1)

    e = 3
    while e < phi:
        if greatest_common_divisor(e, phi) == 1:
            break
        else:
            e += 1

    for i in range(2, phi):
        if (e * i) % phi == 1:
            d = i
    return e, d, modulus, phi


def print_generated_rsa_keys(e, d, modulus, phi):
    print(f'RSA key pair generated:')
    print(f'n={modulus}')
    print(f'e={e}')
    print(f'd={d}')
    print(f'phi={phi}')


def print_generated_keys_to_files(e, d, modulus):
    with open('public_key.txt', 'w') as f:
        f.write(f'n={modulus}\n')
        f.write(f'e={e}')
    with open('private_key.txt', 'w') as f:
        f.write(f'n={modulus}\n')
        f.write(f'd={d}')


# RSA Encryption
def encrypt_text(plaintext_ascii, e, n):
    ciphertext = []
    for i in plaintext_ascii:
        ciphertext.append(pow(i, int(e), int(n)))
    return [hex(c) for c in ciphertext]


def print_ciphertext(ciphertext, prefix="Ciphertext:"):
    txt = prefix
    for i in ciphertext:
        txt += f' {i}'
    print(txt)


def write_ciphertext_to_file(ciphertext, output):
    with open(output, 'w') as f:
        for i in ciphertext:
            if i == ciphertext[-1]:
                f.write(f'{i}')
                break
            f.write(f'{i} ')


# RSA Decryption
def decrypt_text(ciphertext, d, n):
    plaintext = []
    for i in ciphertext:
        plaintext.append(pow(i, int(d), int(n)))
    return ''.join([chr(c) for c in plaintext])


# RSA Signature Creation
def create_signature(message, d, n):
    message_ascii = [ord(c) for c in message]
    signature = encrypt_text(message_ascii, d, n)
    return signature


# RSA Signature Verification
def verify_signature(signature, e, n):
    decrypted_signature = decrypt_text(signature, e, n)
    return decrypted_signature


# Driver code
parser = argparse.ArgumentParser(description='RSA Key Generator')

# Args for key generation
parser.add_argument('--generate-key', action='store_true',
                    help='Generate RSA key')
parser.add_argument('--p', type=int, help='Prime number p')
parser.add_argument('--q', type=int, help='Prime number q')

# Args for encryption
parser.add_argument("--encrypt", type=str, help="Path to the plaintext file.")
parser.add_argument("--public-key", type=str,
                    help="Path to the public key file.")
parser.add_argument("--output", type=str,
                    help="Path to the output file.")

# Args for decryption
parser.add_argument("--decrypt", type=str, help="Path to the encrypted file.")
parser.add_argument("--private-key", type=str,
                    help="Path to the private key file.")

# Args for signature creation
parser.add_argument("--sign", type=str, help="Message to sign.")
parser.add_argument("--signature", type=str, help="Path to the signature file.")

# Args for signature verification
parser.add_argument("--verify", type=str, help="Message to verify.")
parser.add_argument("--public-key", type=str, help="Path to the public key file.")

args = parser.parse_args()

if args.generate_key:
    p = args.p
    q = args.q
    e, d, modulus, phi = generate_rsa_keys(p, q)
    print_generated_rsa_keys(e, d, modulus, phi)
    print_generated_keys_to_files(e, d, modulus)

elif args.encrypt:
    encrypt = args.encrypt
    public_key = args.public_key
    output_encrypt = args.output

    plaintext = read_text_from_file(encrypt)
    public_key_data = read_and_parse_public_key(public_key)
    plaintext_ascii = [ord(c) for c in plaintext]

    hex_ciphertext = encrypt_text(
        plaintext_ascii, public_key_data["e"], public_key_data["n"])
    print_ciphertext(hex_ciphertext)
    write_ciphertext_to_file(hex_ciphertext, output_encrypt)

elif args.decrypt:
    decrypt = args.decrypt
    private_key = args.private_key
    output_decrypt = args.output

    ciphertext = read_text_from_file(decrypt)
    ciphertext = ciphertext.split(' ')
    ciphertext = [int(c, 16) for c in ciphertext]

    private_key_data = read_and_parse_public_key(private_key)

    plaintext = decrypt_text(
        ciphertext, private_key_data["d"], private_key_data["n"])
    print(f'Decrypted plaintext: {plaintext}')

    with open(output_decrypt, 'w') as f:
        f.write(f'{plaintext}')

elif args.sign:
    sign = args.sign
    private_key = args.private_key
    signature_file = args.signature

    private_key_data = read_and_parse_public_key(private_key)

    signature = create_signature(sign, private_key_data["d"], private_key_data["n"])
    write_ciphertext_to_file(signature, signature_file)
    print_ciphertext(signature, "Signature:")

elif args.verify:
    verify = args.verify
    public_key = args.public_key
    signature_file = args.signature

    public_key_data = read_and_parse_public_key(public_key)

    signature = read_text_from_file(signature_file)
    signature = signature.split(' ')
    signature = [int(c, 16) for c in signature]

    decrypted_signature = verify_signature(signature, public_key_data["e"], public_key_data["n"])

    if verify == decrypted_signature:
        print("Signature is valid")
    else:
        print("Signature is invalid")

else:
    print("No arguments provided. Please use --help to see the list of available arguments.")
