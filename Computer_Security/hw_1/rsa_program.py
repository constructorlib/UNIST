import sys
import argparse


def gcd(a, b):
  if b == 0:
    return a
  return gcd(b, a % b)

def lcm(a, b):
  return a * b // gcd(a, b)

def extended_gcd(a, b):
  if b == 0:
    return a, 1, 0
  else:
    gcd, x, y = extended_gcd(b, a % b)
    return gcd, y, x - (a // b) * y

def mod_inverse(e, lambda_n):
  gcd, d, _ = extended_gcd(e, lambda_n)
  if gcd == 1:
    # Ensure d is positive
    d = (d % lambda_n + lambda_n) % lambda_n
    return d
  else:
    raise ValueError("The modular inverse does not exist.")


def parse_n_and_e():
  # Open the file in read mode
  with open(args.public_key, 'r') as file:
    # Initialize variables to store n and e
    n = None
    e = None

    # Loop through each line in the file
    for line in file:
      # Split the line based on the '=' character
      parts = line.strip().split('=')

      # Check if there are two parts and the first part is 'n'
      if len(parts) == 2 and parts[0] == 'n':
        n = int(parts[1])
      # Check if there are two parts and the first part is 'e'
      elif len(parts) == 2 and parts[0] == 'e':
        e = int(parts[1])

  # Check if both n and e were found in the file
  if n is not None and e is not None:
    return (n, e)
  else:
    print("Unable to find n and e in the file.")
    exit(-1)

def parse_n_and_d():
  # Open the file in read mode
  with open(args.private_key, 'r') as file:
    # Initialize variables to store n and d
    n = None
    d = None

    # Loop through each line in the file
    for line in file:
      # Split the line based on the '=' character
      parts = line.strip().split('=')

      # Check if there are two parts and the first part is 'n'
      if len(parts) == 2 and parts[0] == 'n':
        n = int(parts[1])
      # Check if there are two parts and the first part is 'd'
      elif len(parts) == 2 and parts[0] == 'd':
        d = int(parts[1])

  # Check if both n and d were found in the file
  if n is not None and d is not None:
    return (n, d)
  else:
    print("Unable to find n and d in the file.")
    exit(-1)

def generate_key():
  p = args.p
  q = args.q

  n = p * q
  phi = (p - 1) * (q - 1)
  e = 0


  # Choosing e
  for i in range(3, phi, 2):
    if (gcd(i, phi) == 1):
      e = i
      break

  d = mod_inverse(e, phi)

  print("RSA key pair generated:")
  print("n={}".format(n))
  print("e={}".format(e))
  print("d={}".format(d))
  print("phi={}".format(phi))


  public = open("public_key.txt", "w")
  public.write("n={}\n".format(n))
  public.write("e={}\n".format(e))
  public.close()

  private = open("private_key.txt", "w")
  private.write("n={}\n".format(n))
  private.write("d={}\n".format(d))
  private.close()


def encrypt():
  n, e = parse_n_and_e()

  print("Ciphertext: ", end='')

  ciphertext = open(args.output, "w")

  with open(args.encrypt, 'rb') as file:
    while True:
        char = file.read(1)
        if not char:
            break
        hex_value = (ord(char))
        cipher = (hex_value**e)%n
        print(hex(cipher), end=' ')
        ciphertext.write(hex(cipher) + " ")

  ciphertext.close()

def decrypt():
  n, d = parse_n_and_d()

  print("Decrypted plaintext: ", end='')

  decrypted = open(args.output, "w")
  with open(args.decrypt, 'r') as file:
    content = file.read()
    hex_values = content.split()
    for hex_value in hex_values:
      try:
        decimal_value = int(hex_value, 16)  # Convert hex to decimal
        print(chr((decimal_value**d)%n), end="")
        decrypted.write(chr((decimal_value**d)%n))
      except ValueError:
        exit(-1)

  decrypted.close()

def sign():
  n, d = parse_n_and_d()
  print("Signature: ")
  signature = open(args.signature, "w")
  for ch in args.sign:
    print(hex(((ord(ch)**d) % n)), end=' ')
    signature.write(hex(((ord(ch)**d) % n)) + " ")
  signature.close()

def verify():
  n, e = parse_n_and_e()
  newStr = ""
  with open(args.signature, 'r') as file:
    content = file.read()
    hex_values = content.split()
    for hex_value in hex_values:
      try:
        decimal_value = int(hex_value, 16)  # Convert hex to decimal
        newStr = newStr + chr((decimal_value**e) % n)
      except ValueError:
        exit(-1)
  if (newStr == args.verify):
    print("Signature is valid")
  else:
    print("Signature is invalid")


if __name__ == "__main__":
  parser = argparse.ArgumentParser(description='Mini-RSA')
  parser.add_argument('--p', type=int, help='The first prime number')
  parser.add_argument('--q', type=int, help='The second prime number')
  parser.add_argument('--generate-key', help='To generate key', nargs='?', const=True)
  parser.add_argument('--encrypt', type=str, help='To encrypt file')
  parser.add_argument('--decrypt', type=str, help='To decrypt file')
  parser.add_argument('--public-key', type=str, help="Public key")
  parser.add_argument('--private-key', type=str, help="Private key")
  parser.add_argument('--output', type=str, help="Output file")
  parser.add_argument('--sign', help='To sign document', nargs='?', const=True)
  parser.add_argument('--verify', help='To verify document', nargs='?', const=True)
  parser.add_argument('--signature', type=str, help="Signature file output")

  args = parser.parse_args()

  if args.generate_key == True:
    generate_key()
  elif args.encrypt:
    encrypt()
  elif args.decrypt:
    decrypt()
  elif args.sign:
    sign()
  elif args.verify:
    verify()
  else:
    print("Nothing to do")


