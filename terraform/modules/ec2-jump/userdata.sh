#!/bin/bash
set -e

# Update OS
yum update -y

# Install AWS CLI v2
curl -s "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
unzip -q /tmp/awscliv2.zip -d /tmp
/tmp/aws/install
rm -rf /tmp/aws /tmp/awscliv2.zip

# Install AWS SSM Agent (allows Session Manager as alternative to SSH)
yum install -y amazon-ssm-agent
systemctl enable amazon-ssm-agent
systemctl start amazon-ssm-agent

# Install kubectl (to manage EKS from jump server)
curl -sLO "https://dl.k8s.io/release/$(curl -sL https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
mv kubectl /usr/local/bin/kubectl

# Harden SSH: disable root login and password auth
sed -i 's/^PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd

# Session audit logging — all SSH sessions logged to /var/log/session/
mkdir -p /var/log/session
chmod 1777 /var/log/session
echo 'session required pam_tty_audit.so enable=*' >> /etc/pam.d/sshd

echo "Jump server bootstrap complete." >> /var/log/userdata.log
