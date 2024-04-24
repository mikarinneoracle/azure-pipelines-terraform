import tasks = require('azure-pipelines-task-lib/task');
import {ToolRunner} from 'azure-pipelines-task-lib/toolrunner';
import {TerraformAuthorizationCommandInitializer} from './terraform-commands';
import {BaseTerraformCommandHandler} from './base-terraform-command-handler';
import { readFileSync } from 'fs';
const fs = require('fs');

export class TerraformCommandHandlerOCI extends BaseTerraformCommandHandler {
    constructor() {
        super();
        this.providerName = "oci";
    }

    private setupBackend(backendServiceName: string) {
    }

    public async handleBackend(terraformToolRunner: ToolRunner) : Promise<void> {
        let backendServiceName = tasks.getInput("backendServiceOCI", true);
        this.setupBackend(backendServiceName);

        for (let [key, value] of this.backendConfig.entries()) {
            terraformToolRunner.arg(`-backend-config=${key}=${value}`);
        }
    }

    public async handleProvider(command: TerraformAuthorizationCommandInitializer) : Promise<void> {
        console.log("key" + tasks.getEndpointDataParameterRequired(command.serviceProvidername, "key"));
        console.log("user" + tasks.getEndpointDataParameterRequired(command.serviceProvidername, "user"));
        console.log("tenancy" + tasks.getEndpointDataParameterRequired(command.serviceProvidername, "tenancy"));
        console.log("fingerprint=" + tasks.getEndpointDataParameterRequired(command.serviceProvidername, "fingerprint"));
        console.log("region=" + tasks.getEndpointDataParameterRequired(command.serviceProvidername, "region"));

        if (command.serviceProvidername) {
            fs.writeFile('./key.pem', tasks.getEndpointAuthorizationParameter(command.serviceProvidername, "key", false),  function(err) {
                if (err) {
                    return console.error(err);
                }
                console.log("key.pem created");
            });

            /*
            provider "oci" {
            tenancy_ocid = "<tenancy-ocid>"
            user_ocid = "<user-ocid>" 
            private_key_path = "<rsa-private-key-path>"
            fingerprint = "<fingerprint>"
            region = "<region-identifier>"
            }
            */

            var data = "provider \"oci\" {\n";
            data = data + "tenancy_ocid = \"" + tasks.getEndpointDataParameterRequired(command.serviceProvidername, "tenancy") + "\"\n";
            data = data + "user_ocid = \"" + tasks.getEndpointDataParameterRequired(command.serviceProvidername, "user") + "\"\n";
            data = data + "fingerprint = \"" + tasks.getEndpointDataParameterRequired(command.serviceProvidername, "fingerprint") + "\"\n";
            data = data + "region = \"" + tasks.getEndpointDataParameterRequired(command.serviceProvidername, "region") + "\"\n";
            data = data + "private_key_path = \"key.pem\"\n";
            data = "}\n";

            fs.writeFile('./provider.tf', data,  function(err) {
                if (err) {
                    return console.error(err);
                }
                console.log("provider.tf created");
            });

            process.env['TF_VAR_user_ocid']  = tasks.getEndpointDataParameterRequired(command.serviceProvidername, "user");
            process.env['TF_VAR_tenancy_ocid']  = tasks.getEndpointDataParameterRequired(command.serviceProvidername, "tenancy");        
            process.env['TF_VAR_fingerprint']  = tasks.getEndpointDataParameterRequired(command.serviceProvidername, "fingerprint");
            process.env['TF_VAR_private_key_path']  =  "./key.pem";      
            process.env['TF_VAR_region']  = tasks.getEndpointDataParameterRequired(command.serviceProvidername, "region");  
        }
    }
}