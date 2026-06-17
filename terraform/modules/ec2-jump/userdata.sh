```bash
#!/bin/bash
set -e

export DEBIAN_FRONTEND=noninteractive

# Update OS
apt-get update
apt-get upgrade -y

# Install required packages
apt-get install -y curl unzip wget ca-certificates

# Install AWS CLI v2
curl -s "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
unzip -q /tmp/awscliv2.zip -d /tmp
/tmp/aws/install
rm -rf /tmp/aws /tmp/awscliv2.zip

# Install AWS SSM Agent
snap install amazon-ssm-agent --classic
systemctl enable snap.amazon-ssm-agent.amazon-ssm-agent.service
systemctl start snap.amazon-ssm-agent.amazon-ssm-agent.service

# Install kubectl
curl -sLO "https://dl.k8s.io/release/$(curl -sL https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
rm -f kubectl

# Harden SSH
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config

systemctl restart ssh

# Session audit logging
mkdir -p /var/log/session
chmod 1777 /var/log/session

if ! grep -q "pam_tty_audit.so" /etc/pam.d/sshd; then
    echo "session required pam_tty_audit.so enable=*" >> /etc/pam.d/sshd
fi

echo "Jump server bootstrap complete." >> /var/log/user-data.log
```
